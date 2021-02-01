import Vue from 'vue'
import store from './store'
import Target from './Target.vue'
import Other from './Other.vue'
import Init from './Init.vue'
import Counter from './Counter.vue'
import RefTester from './RefTester.vue'
import VuexObject from './VuexObject.vue'
import NativeTypes from './NativeTypes.vue'
import Events from './Events.vue'
import MyClass from './MyClass.js'
import router from './router'
import TransitionExample from './TransitionExample.vue'
import Router from './router/Router.vue'

window.VUE_DEVTOOLS_CONFIG = {
  openInEditorHost: '/'
}

const items = []
for (let i = 0; i < 100; i++) {
  items.push({ id: i })
}

const circular = {}
circular.self = circular

const app = new Vue({
  store,
  router,
  data: {
    obj: {
      items: items,
      circular
    }
  },
  render (h) {
    return h('div', null, [
      h(Counter),
      h(Target, { props: { msg: 'hi', ins: new MyClass() } }),
      h(Other),
      h(Events, { key: 'foo' }),
      h(NativeTypes, { key: new Date() }),
      h(Router, { key: [] }),
      h(TransitionExample),
      h(VuexObject),
      h(Init),
      h(RefTester)
    ])
  }
})

window.addEventListener('load', () => {
  app.$mount('#app')
})

// custom element instance
const ce = document.querySelector('#shadow')
if (ce.attachShadow) {
  const shadowRoot = ce.attachShadow({ mode: 'open' })

  const ceVM = new Vue({
    name: 'Shadow',
    render (h) {
      return h('h2', 'Inside Shadow DOM!')
    }
  }).$mount()

  shadowRoot.appendChild(ceVM.$el)
}
