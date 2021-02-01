<template>
  <div id="target">
    <h1>{{ localMsg }} {{ msg }}</h1>
    <span>Regex: {{ regex.toString() }}</span>
    <input @keyup.enter="regex = new RegExp($event.target.value)">
    <span>(Press enter to set)</span>
    <br>
    <button
      class="add"
      @mouseup="add"
    >
      Add 3
    </button>
    <button
      class="remove"
      @mousedown="rm"
    >
      Remove
    </button>
    <input v-model="localMsg">
    <other
      v-for="item in items"
      :id="item"
      :key="item"
      attr="some-attr"
    />
    <div>
      <button
        class="inspect"
        @click="inspect"
        @mouseover="over = true"
        @mouseout="over = false"
      >
        Inspect component
      </button>
      <span
        v-if="over"
        class="over"
      >Mouse over</span>
    </div>
    <div>
      <Functional
        v-for="n in 5"
        :key="n"
        :name="`Row ${n}`"
      />
      <Functional
        name="Embed component"
      >
        <Other :key="0" />
      </Functional>
      <Functional
        name="Embed functional component"
      >
        <Functional name="Child" />
      </Functional>
    </div>
  </div>
</template>

<script>
import Other from './Other.vue'
import MyClass from './MyClass.js'
import Functional from './Functional.vue'
export default {
  components: {
    Other,
    Functional
  },
  props: {
    msg: String,
    obj: null,
    ins: MyClass
  },
  data () {
    console.log('this.obj', this.obj)
    return {
      localMsg: this.msg,
      items: [1, 2],
      regex: /(a\w+b)/g,
      nan: NaN,
      infinity: Infinity,
      negativeInfinity: -Infinity,
      over: false
    }
  },
  computed: {
    awww () {
      return {
        a: {
          b: {
            c: 123
          }
        }
      }
    }
  },
  methods: {
    add () {
      const l = this.items.length
      this.items.push(
        l + 1,
        l + 2,
        l + 3
      )
    },
    rm () {
      this.items.pop()
    },
    inspect () {
      this.$inspect()
    }
  }
}
</script>

<style lang="stylus">
body
  background white
</style>

<style lang="stylus" scoped>
.inspect
  border solid 1px black
  background #eee
  color black
  border-radius 2px
  padding 6px 12px
  cursor pointer
  &:hover
    border-color blue
    color blue

.over
  pointer-events none
  margin-left 12px
</style>
