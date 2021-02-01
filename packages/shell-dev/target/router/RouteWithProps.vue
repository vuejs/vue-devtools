<template>
  <div>
    <p>Hello from route with props: Username: {{ username }}, Id: {{ id }}</p>
  </div>
</template>

<script>
export default {
  props: {
    username: {
      type: String,
      default: 'ms'
    },
    id: {
      type: Number,
      default: 33
    }
  }
}
</script>
