<template>
  <div id="tester">
    <p
      id="testing"
      ref="tester"
      class="test test1"
    >
      {{ count }}
    </p>

    <ul>
      <li
        v-for="i in 4"
        :key="i"
        ref="list"
      >
        {{ i }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  computed: {
    count () { return 1 }
  }
}
</script>
