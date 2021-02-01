<template>
  <div id="vuex-object">
    <h2>Vuex Object</h2>
    <pre>{{ object }}</pre>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['object'])
  }
}
</script>

<style scoped>

</style>
