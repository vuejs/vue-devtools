<template>
  <div id="date">
    <p>Date: {{ date.toString() }} - Hours: {{ hours }} - Prototype: {{ date | prototypeString }}</p>

    <p>
      <button @click="updateDate">
        Update Date
      </button>
    </p>

    <hr>

    <TestComponent ref="component" />

    <div
      id="aDiv"
      ref="someDiv"
    />

    <p>
      <button @click="sendComponent()">
        Vuex mutation
      </button>
      <button
        style="background: red; color: white;"
        @click="createLargeArray()"
      >
        Create large array
      </button>
    </p>

    <p>
      Large array size: {{ largeArray.length }}
    </p>

    <h3>Set</h3>
    <pre>{{ setDisplay() }}</pre>

    <h3>Map</h3>
    <pre>{{ mapDisplay() }}</pre>

    <p>
      <button @click="testVuexSet()">
        Vuex Set
      </button>
      <button @click="testVuexMap()">
        Vuex Map
      </button>
      <button @click="forceRefresh()">
        Refresh
      </button>
    </p>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import CompDef from './Other.vue'

function setToString (func, string) {
  return Object.defineProperty(func, 'toString', {
    configurable: true,
    enumerable: false,
    value: () => string,
    writable: true
  })
}

const aWeirdFunction = setToString(function weird (a, b, c) {}, 'foo')

function sum (a, b) {
  return a + b
}

const handler = {
  apply: function (target, thisArg, argumentsList) {
    console.log(`Calculate sum: ${argumentsList}`)
    return argumentsList[0] + argumentsList[1]
  }
}

const proxy1 = new Proxy(sum, handler)

let veryLongText = ''
for (let i = 0; i < 1000000; i++) {
  veryLongText += `line${i}\n`
}

export default {
  components: {
    TestComponent: {
      props: { bar: { default: 'hey' } },
      data: () => ({ foo: '42' }),
      computed: {
        parentComp () { return this.$parent }
      },
      render: h => h('div', '<TestComponent />')
    }
  },

  filters: {
    prototypeString: val => Object.prototype.toString.call(val)
  },

  data () {
    return {
      localDate: new Date(),
      reg: /abc/gi,
      testComponent: null,
      hello: function foo (a, b, c) {},
      hey: function empty () {},
      anon: function (foo, bar) {},
      aWeirdFunction,
      arrow: (a, b) => {},
      def: CompDef,
      def2: {
        name: 'MyComponent',
        render () {}
      },
      def3: {
        render () {}
      },
      largeArray: [],
      i: new Set([1, 2, 3, 4, new Set([5, 6, 7, 8]), new Map([[1, 2], [3, 4], [5, new Map([[6, 7]])]])]),
      j: new Map([[1, 2], [3, 4], [5, new Map([[6, 7]])], [8, new Set([1, 2, 3, 4, new Set([5, 6, 7, 8]), new Map([[1, 2], [3, 4], [5, new Map([[6, 7]])]])])]]),
      html: '<b>Bold</b> <i>Italic</i>',
      htmlReg: /<b>hey<\/b>/i,
      'html <b>key</b>': (h, t, m, l) => {},
      proxy1,
      sym: Symbol('test'),
      multiLineParameterFunction: function (a,
        b,
        c) {},
      veryLongText
    }
  },
  computed: {
    ...mapState([
      'date',
      'set',
      'map'
    ]),

    ...mapGetters([
      'hours'
    ]),

    theRouter () {
      return this.$router
    },

    theStore () {
      return this.$store
    }
  },

  mounted () {
    this.testComponent = this.$refs.component
  },

  methods: {
    ...mapMutations({
      updateDate: 'UPDATE_DATE',
      testVuexSet: 'TEST_SET',
      testVuexMap: 'TEST_MAP'
    }),

    sendComponent () {
      this.$store.commit('TEST_COMPONENT', this.testComponent)
    },

    createLargeArray () {
      const list = []
      for (let i = 0; i < 10000000; i++) {
        list.push(i)
      }
      this.largeArray = list
    },

    setDisplay () {
      if (this.set) return Array.from(this.set)
    },

    mapDisplay () {
      if (this.map) return [...this.map]
    },

    forceRefresh () {
      this.$forceUpdate()
    }
  }
}
</script>
