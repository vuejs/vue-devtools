import { stringify } from '@utils/util'
import { getInstanceName } from './index'

const internalRE = /^(?:pre-)?hook:/

export function initEventsBackend (Vue, bridge) {
  let recording = true

  bridge.send('events:reset')

  bridge.on('events:toggle-recording', enabled => {
    recording = enabled
  })

  function logEvent (vm, type, eventName, payload) {
    // The string check is important for compat with 1.x where the first
    // argument may be an object instead of a string.
    // this also ensures the event is only logged for direct $emit (source)
    // instead of by $dispatch/$broadcast
    if (typeof eventName === 'string' && !internalRE.test(eventName)) {
      bridge.send('event:triggered', stringify({
        eventName,
        type,
        payload,
        instanceId: vm._uid,
        instanceName: getInstanceName(vm._self || vm),
        timestamp: Date.now()
      }))
    }
  }

  function wrap (method) {
    const original = Vue.prototype[method]
    if (original) {
      Vue.prototype[method] = function (...args) {
        const res = original.apply(this, args)
        if (recording) {
          logEvent(this, method, args[0], args.slice(1))
        }
        return res
      }
    }
  }

  function wrapSetup () {
    const originalSetup = Vue.prototype.setup
    if (originalSetup) {
      const watch = Vue.prototype.$watch
      Vue.prototype.setup = function (dataAndMethods, ctx) {
        const wrappedContext = {}
        let value
        for (let prop in dataAndMethods) {
          value = dataAndMethods[prop]
          // I thought about wrapping observables to emit changes on them
          if (value && typeof value !== 'function' && value.hasOwnProperty('__ob__')) {
            watch(() => value, () => {
              if (recording) {
                try {
                  logEvent(this, 'composition', (new Error()).stack.match(/at (\S+)/g).map(row => row.slice(3)))
                } catch (e) {
                  //
                }
              }
            })
          }
          wrappedContext[prop] = value
          return originalSetup(wrappedContext, ctx)
        }
      }
    }
  }

  wrap('$emit')
  wrap('$broadcast')
  wrap('$dispatch')
  wrapSetup()
}
