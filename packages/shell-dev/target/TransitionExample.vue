<template>
  <div>
    <div data-test-id="transition">
      <button @click="show = !show">
        Toggle
      </button>
      <transition name="fade">
        <TestComponent v-if="show">
          hello
        </TestComponent>
      </transition>
    </div>

    <div data-test-id="transition-list">
      <button @click="++count">
        Add
      </button>
      <button @click="--count">
        Remove
      </button>
      <transition-group
        name="list"
        tag="p"
      >
        <component
          :is="'TestComponent'"
          v-for="item in count"
          :key="item"
          class="list-item"
        >
          {{ item }}
        </component>
      </transition-group>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    TestComponent: {
      render (h) {
        return h('div', {}, this.$slots.default)
      }
    }
  },
  data () {
    return {
      show: true,
      count: 5
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
