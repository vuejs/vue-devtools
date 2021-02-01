<template>
  <div>
    <h1>Events</h1>
    <event-child
      @event="log"
      @event-1="log"
      @event-2="log"
    />
    <event-child-1 @log="log" />
    <event-child-cond
      v-if="toggleCond"
      @log="log"
    />
    <button @click="toggleCond = !toggleCond">
      Toggle Cond
    </button>
  </div>
</template>

<script>
import EventChild from './EventChild.vue'
import EventChild1 from './EventChild1.vue'
import EventChildCond from './EventChildCond.vue'
export default {
  components: {
    EventChild,
    EventChild1,
    EventChildCond
  },
  data () {
    return {
      toggleCond: false
    }
  },
  methods: {
    log (data) {
      // console.log('Event fired from child component with data', data)
    }
  }
}
</script>
