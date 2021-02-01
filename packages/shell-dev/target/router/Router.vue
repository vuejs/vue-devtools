<template>
  <div>
    <p>
      <router-link to="/route-one">
        Go to Route One
      </router-link>
    </p>
    <p>
      <router-link to="/route-two">
        Go to Route Two
      </router-link>
    </p>
    <p>
      <router-link to="/route-with-params/markussorg/5">
        Go to route with params
      </router-link>
    </p>
    <p>
      <router-link to="/route-named">
        Go to named route
      </router-link>
    </p>
    <p>
      <router-link to="/route-with-query?el=value&test=true">
        Go to route with query
      </router-link>
    </p>
    <p>
      <router-link to="/route-with-before-enter">
        Go to route with before enter
      </router-link>
    </p>
    <p>
      <router-link to="/route-with-redirect">
        Go to route with redirect
      </router-link>
    </p>
    <p>
      <router-link to="/this-is-the-alias">
        Go to route with alias
      </router-link>
    </p>
    <p>
      <router-link to="/route-with-dynamic-component">
        Go to route with dyn. component
      </router-link>
    </p>
    <p>
      <router-link to="/route-with-props">
        Go to route with props
      </router-link>
    </p>
    <p>
      <router-link to="/route-with-props-default">
        Go to route with props (default)
      </router-link>
    </p>
    <p>
      <router-link to="/route-parent">
        Go to route parent
      </router-link>
    </p>
    <p>
      <router-link to="/route-child">
        Go to route child
      </router-link>
    </p>
    <keep-alive>
      <router-view />
    </keep-alive>
    <p>
      <button @click="addRoutes">
        Add new routes
      </button>
    </p>
  </div>
</template>

<script>
import RouteOne from './RouteOne.vue'

export default {
  methods: {
    addRoutes () {
      this.$router.addRoutes([
        { path: '/new-route', component: RouteOne }
      ])
    }
  }
}
</script>
