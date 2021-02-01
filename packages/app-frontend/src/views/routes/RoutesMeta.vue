<template>
  <scroll-pane>
    <div
      v-if="activeRouteChange"
      slot="scroll"
    >
      <state-inspector :state="{ options }" />
    </div>
    <div
      v-else
      slot="scroll"
      class="no-route-data"
    >
      No route selected
    </div>
  </scroll-pane>
</template>

<script>
import StateInspector from '@front/components/StateInspector.vue'
import ScrollPane from '@front/components/ScrollPane.vue'
import { mapGetters } from 'vuex'
import { UNDEFINED } from '@utils/util'

export default {
  components: {
    ScrollPane,
    StateInspector
  },
  computed: {
    ...mapGetters('routes', [
      'activeRouteChange'
    ]),
    options () {
      return this.sanitizeRouteData(this.activeRouteChange)
    },
    to () {
      return this.sanitizeRouteData(this.activeRouteChange.to)
    },
    from () {
      return this.sanitizeRouteData(this.activeRouteChange.from)
    }
  },
  methods: {
    sanitizeRouteData (routeData) {
      console.log(routeData)
      const data = {
        path: routeData.path
      }
      if (routeData.redirect) {
        data.redirect = routeData.redirect
      }
      if (routeData.alias) {
        data.alias = routeData.alias
      }
      if (!this.isEmptyObject(routeData.props)) {
        data.props = routeData.props
      }
      if (routeData.name && routeData.name !== UNDEFINED) {
        data.name = routeData.name
      }
      if (routeData.meta && !this.isEmptyObject(routeData.meta)) {
        data.meta = routeData.meta
      }
      if (routeData.component) {
        const component = {}
        // if (routeData.component.__file) {
        //   component.file = routeData.component.__file
        // }
        if (routeData.component.template) {
          component.template = routeData.component.template
        }
        if (routeData.component.props) {
          component.props = routeData.component.props
        }
        if (!this.isEmptyObject(component)) {
          data.component = component
        }
      }
      if (routeData.children) {
        data.children = []
        routeData.children.forEach((item) => {
          data.children.push(this.sanitizeRouteData(item))
        })
      }
      return data
    },
    isEmptyObject (obj) {
      return obj === UNDEFINED || !obj || Object.keys(obj).length === 0
    }
  }
}
</script>

<style lang="stylus" scoped>
.no-route-data
  color: #ccc
  text-align: center
  margin-top: 50px
  line-height: 30px
</style>
