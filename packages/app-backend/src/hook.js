// this script is injected into every page.

/**
 * Install the hook on window, which is an event emitter.
 * Note because Chrome content scripts cannot directly modify the window object,
 * we are evaling this function by inserting a script tag. That's why we have
 * to inline the whole event emitter implementation here.
 *
 * @param {Window|global} target
 */

export function installHook (target) {
  let listeners = {}

  if (target.hasOwnProperty('__VUE_DEVTOOLS_GLOBAL_HOOK__')) return

  const hook = {
    Vue: null,

    _buffer: [],

    _replayBuffer (event) {
      let buffer = this._buffer
      this._buffer = []

      for (let i = 0, l = buffer.length; i < l; i++) {
        let allArgs = buffer[i]
        allArgs[0] === event
          ? this.emit.apply(this, allArgs)
          : this._buffer.push(allArgs)
      }
    },

    on (event, fn) {
      const $event = '$' + event
      if (listeners[$event]) {
        listeners[$event].push(fn)
      } else {
        listeners[$event] = [fn]
        this._replayBuffer(event)
      }
    },

    once (event, fn) {
      function on () {
        this.off(event, on)
        fn.apply(this, arguments)
      }
      this.on(event, on)
    },

    off (event, fn) {
      event = '$' + event
      if (!arguments.length) {
        listeners = {}
      } else {
        const cbs = listeners[event]
        if (cbs) {
          if (!fn) {
            listeners[event] = null
          } else {
            for (let i = 0, l = cbs.length; i < l; i++) {
              const cb = cbs[i]
              if (cb === fn || cb.fn === fn) {
                cbs.splice(i, 1)
                break
              }
            }
          }
        }
      }
    },

    emit (event) {
      const $event = '$' + event
      let cbs = listeners[$event]
      if (cbs) {
        const eventArgs = [].slice.call(arguments, 1)
        cbs = cbs.slice()
        for (let i = 0, l = cbs.length; i < l; i++) {
          cbs[i].apply(this, eventArgs)
        }
      } else {
        const allArgs = [].slice.call(arguments)
        this._buffer.push(allArgs)
      }
    }
  }

  hook.once('init', Vue => {
    hook.Vue = Vue

    Vue.prototype.$inspect = function () {
      const fn = target.__VUE_DEVTOOLS_INSPECT__
      fn && fn(this)
    }
  })

  hook.once('vuex:init', store => {
    hook.store = store
    hook.initialState = clone(store.state)
    // fix store.replaceState cound be undefined
    if (typeof store.replaceState !== 'function') {
      store.replaceState = function () {}
    }
    const origReplaceState = store.replaceState.bind(store)
    store.replaceState = state => {
      hook.initialState = clone(state)
      origReplaceState(state)
    }
    // Dynamic modules
    let origRegister, origUnregister
    if (store.registerModule) {
      hook.storeModules = []
      origRegister = store.registerModule.bind(store)
      store.registerModule = (path, module, options) => {
        if (typeof path === 'string') path = [path]
        hook.storeModules.push({ path, module, options })
        origRegister(path, module, options)
        if (process.env.NODE_ENV !== 'production') console.log('early register module', path, module, options)
      }
      origUnregister = store.unregisterModule.bind(store)
      store.unregisterModule = (path) => {
        if (typeof path === 'string') path = [path]
        const key = path.join('/')
        const index = hook.storeModules.findIndex(m => m.path.join('/') === key)
        if (index !== -1) hook.storeModules.splice(index, 1)
        origUnregister(path)
        if (process.env.NODE_ENV !== 'production') console.log('early unregister module', path)
      }
    }
    hook.flushStoreModules = () => {
      store.replaceState = origReplaceState
      if (store.registerModule) {
        store.registerModule = origRegister
        store.unregisterModule = origUnregister
      }
      return hook.storeModules || []
    }
  })

  Object.defineProperty(target, '__VUE_DEVTOOLS_GLOBAL_HOOK__', {
    get () {
      return hook
    }
  })

  // Clone deep utility for cloning initial state of the store
  // Forked from https://github.com/planttheidea/fast-copy
  // Last update: 2019-10-30
  // ⚠️ Don't forget to update `./hook.js`

  // utils
  const { toString: toStringFunction } = Function.prototype
  const {
    create,
    defineProperty,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
    getOwnPropertySymbols,
    getPrototypeOf
  } = Object
  const { hasOwnProperty, propertyIsEnumerable } = Object.prototype

  /**
   * @enum
   *
   * @const {Object} SUPPORTS
   *
   * @property {boolean} SYMBOL_PROPERTIES are symbol properties supported
   * @property {boolean} WEAKSET is WeakSet supported
   */
  const SUPPORTS = {
    SYMBOL_PROPERTIES: typeof getOwnPropertySymbols === 'function',
    WEAKSET: typeof WeakSet === 'function'
  }

  /**
   * @function createCache
   *
   * @description
   * get a new cache object to prevent circular references
   *
   * @returns the new cache object
   */
  const createCache = () => {
    if (SUPPORTS.WEAKSET) {
      return new WeakSet()
    }

    const object = create({
      add: (value) => object._values.push(value),
      has: (value) => !!~object._values.indexOf(value)
    })

    object._values = []

    return object
  }

  /**
   * @function getCleanClone
   *
   * @description
   * get an empty version of the object with the same prototype it has
   *
   * @param object the object to build a clean clone from
   * @param realm the realm the object resides in
   * @returns the empty cloned object
   */
  const getCleanClone = (object, realm) => {
    if (!object.constructor) {
      return create(null)
    }

    // eslint-disable-next-line no-proto
    const prototype = object.__proto__ || getPrototypeOf(object)

    if (object.constructor === realm.Object) {
      return prototype === realm.Object.prototype ? {} : create(prototype)
    }

    if (~toStringFunction.call(object.constructor).indexOf('[native code]')) {
      try {
        return new object.constructor()
      } catch (e) {
        // Error
      }
    }

    return create(prototype)
  }

  /**
   * @function getObjectCloneLoose
   *
   * @description
   * get a copy of the object based on loose rules, meaning all enumerable keys
   * and symbols are copied, but property descriptors are not considered
   *
   * @param object the object to clone
   * @param realm the realm the object resides in
   * @param handleCopy the function that handles copying the object
   * @returns the copied object
   */
  const getObjectCloneLoose = (
    object,
    realm,
    handleCopy,
    cache
  ) => {
    const clone = getCleanClone(object, realm)

    for (const key in object) {
      if (hasOwnProperty.call(object, key)) {
        clone[key] = handleCopy(object[key], cache)
      }
    }

    if (SUPPORTS.SYMBOL_PROPERTIES) {
      const symbols = getOwnPropertySymbols(object)

      if (symbols.length) {
        for (let index = 0, symbol; index < symbols.length; index++) {
          symbol = symbols[index]

          if (propertyIsEnumerable.call(object, symbol)) {
            clone[symbol] = handleCopy(object[symbol], cache)
          }
        }
      }
    }

    return clone
  }

  /**
   * @function getObjectCloneStrict
   *
   * @description
   * get a copy of the object based on strict rules, meaning all keys and symbols
   * are copied based on the original property descriptors
   *
   * @param object the object to clone
   * @param realm the realm the object resides in
   * @param handleCopy the function that handles copying the object
   * @returns the copied object
   */
  const getObjectCloneStrict = (
    object,
    realm,
    handleCopy,
    cache
  ) => {
    const clone = getCleanClone(object, realm)

    const properties = SUPPORTS.SYMBOL_PROPERTIES
      ? [].concat(getOwnPropertyNames(object), getOwnPropertySymbols(object))
      : getOwnPropertyNames(object)

    if (properties.length) {
      for (
        let index = 0, property, descriptor;
        index < properties.length;
        index++
      ) {
        property = properties[index]

        if (property !== 'callee' && property !== 'caller') {
          descriptor = getOwnPropertyDescriptor(object, property)

          descriptor.value = handleCopy(object[property], cache)

          defineProperty(clone, property, descriptor)
        }
      }
    }

    return clone
  }

  /**
   * @function getRegExpFlags
   *
   * @description
   * get the flags to apply to the copied regexp
   *
   * @param regExp the regexp to get the flags of
   * @returns the flags for the regexp
   */
  const getRegExpFlags = (regExp) => {
    let flags = ''

    if (regExp.global) {
      flags += 'g'
    }

    if (regExp.ignoreCase) {
      flags += 'i'
    }

    if (regExp.multiline) {
      flags += 'm'
    }

    if (regExp.unicode) {
      flags += 'u'
    }

    if (regExp.sticky) {
      flags += 'y'
    }

    return flags
  }

  const { isArray } = Array

  const GLOBAL_THIS = (() => {
    if (typeof self !== 'undefined') {
      return self
    }

    if (typeof window !== 'undefined') {
      return window
    }

    if (typeof global !== 'undefined') {
      return global
    }

    if (console && console.error) {
      console.error('Unable to locate global object, returning "this".')
    }
  })()

  /**
   * @function clone
   *
   * @description
   * copy an object deeply as much as possible
   *
   * If `strict` is applied, then all properties (including non-enumerable ones)
   * are copied with their original property descriptors on both objects and arrays.
   *
   * The object is compared to the global constructors in the `realm` provided,
   * and the native constructor is always used to ensure that extensions of native
   * objects (allows in ES2015+) are maintained.
   *
   * @param object the object to copy
   * @param [options] the options for copying with
   * @param [options.isStrict] should the copy be strict
   * @param [options.realm] the realm (this) object the object is copied from
   * @returns the copied object
   */
  function clone (object, options) {
    // manually coalesced instead of default parameters for performance
    const isStrict = !!(options && options.isStrict)
    const realm = (options && options.realm) || GLOBAL_THIS

    const getObjectClone = isStrict
      ? getObjectCloneStrict
      : getObjectCloneLoose

    /**
     * @function handleCopy
     *
     * @description
     * copy the object recursively based on its type
     *
     * @param object the object to copy
     * @returns the copied object
     */
    const handleCopy = (
      object,
      cache
    ) => {
      if (!object || typeof object !== 'object' || cache.has(object)) {
        return object
      }

      // DOM objects
      if (object instanceof HTMLElement) {
        return object.cloneNode(false)
      }

      const Constructor = object.constructor

      // plain objects
      if (Constructor === realm.Object) {
        cache.add(object)

        return getObjectClone(object, realm, handleCopy, cache)
      }

      let clone

      // arrays
      if (isArray(object)) {
        cache.add(object)

        // if strict, include non-standard properties
        if (isStrict) {
          return getObjectCloneStrict(object, realm, handleCopy, cache)
        }

        clone = new Constructor()

        for (let index = 0; index < object.length; index++) {
          clone[index] = handleCopy(object[index], cache)
        }

        return clone
      }

      // dates
      if (object instanceof realm.Date) {
        return new Constructor(object.getTime())
      }

      // regexps
      if (object instanceof realm.RegExp) {
        clone = new Constructor(
          object.source,
          object.flags || getRegExpFlags(object)
        )

        clone.lastIndex = object.lastIndex

        return clone
      }

      // maps
      if (realm.Map && object instanceof realm.Map) {
        cache.add(object)

        clone = new Constructor()

        object.forEach((value, key) => {
          clone.set(key, handleCopy(value, cache))
        })

        return clone
      }

      // sets
      if (realm.Set && object instanceof realm.Set) {
        cache.add(object)

        clone = new Constructor()

        object.forEach((value) => {
          clone.add(handleCopy(value, cache))
        })

        return clone
      }

      // buffers (node-only)
      if (realm.Buffer && realm.Buffer.isBuffer(object)) {
        clone = realm.Buffer.allocUnsafe
          ? realm.Buffer.allocUnsafe(object.length)
          : new Constructor(object.length)

        object.copy(clone)

        return clone
      }

      // arraybuffers / dataviews
      if (realm.ArrayBuffer) {
        // dataviews
        if (realm.ArrayBuffer.isView(object)) {
          return new Constructor(object.buffer.slice(0))
        }

        // arraybuffers
        if (object instanceof realm.ArrayBuffer) {
          return object.slice(0)
        }
      }

      // if the object cannot / should not be cloned, don't
      if (
        // promise-like
        (hasOwnProperty.call(object, 'then') && typeof object.then === 'function') ||
        // errors
        object instanceof Error ||
        // weakmaps
        (realm.WeakMap && object instanceof realm.WeakMap) ||
        // weaksets
        (realm.WeakSet && object instanceof realm.WeakSet)
      ) {
        return object
      }

      cache.add(object)

      // assume anything left is a custom constructor
      return getObjectClone(object, realm, handleCopy, cache)
    }

    return handleCopy(object, createCache())
  }
}
