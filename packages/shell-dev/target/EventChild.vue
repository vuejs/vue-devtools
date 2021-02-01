<template>
  <div>
    <button
      class="btn-emit-event"
      @click="emitEvent"
    >
      Emit
    </button>
    <button
      class="btn-emit-event1"
      @click="emitEvent1"
    >
      Emit
    </button>
    <button
      class="btn-emit-event2"
      @click="emitEvent2"
    >
      Emit
    </button>

    <br>

    <button @click="emitManyEvents">
      Emit a lot of events
    </button>
    <button @click="emitAndCommit">
      Emit and event and commit a mutation
    </button>
  </div>
</template>

<script>
export default {
  methods: {
    emitEvent () {
      const data = {
        eventName: 'event'
      }
      this.$emit('event', data)
    },
    emitEvent1 () {
      const data = {
        eventName: 'event-1'
      }
      this.$emit('event-1', data)
    },
    emitEvent2 () {
      const complexData = {
        componentName: 'EventChild',
        string: 'Lorem ipsum',
        complex: {
          string: 'Lorem ipsum',
          object: {
            number: 23,
            boolean: true,
            array: [1, 2, 3, 4, 5]
          }
        }
      }
      this.$emit('event-2', complexData)
    },

    emitManyEvents () {
      for (let i = 0; i < 10000; i++) {
        this.$emit('event', i)
      }
    },

    emitAndCommit () {
      this.$emit('event-1', 'foobar')
      this.$store.commit('DECREMENT', 'barfoo')
    }
  }
}
</script>
