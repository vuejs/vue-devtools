<template>
  <div>
    <button
      class="btn-emit-log-event"
      @click="emitLogEvent"
    >
      Emit
    </button>
  </div>
</template>

<script>
export default {
  methods: {
    emitLogEvent () {
      this.$emit('log')
    }
  }
}
</script>
