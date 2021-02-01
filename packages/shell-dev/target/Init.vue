<template>
  <div id="init">
    <p>Inited: {{ inited }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      inited: state => state.inited
    })
  },
  created () {
    this.$store.commit('TEST_INIT')
  }
}
</script>
