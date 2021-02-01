<template>
  <div
    :class="{
      inactive: instance.inactive && !instance.parent.inactive,
      selected
    }"
    class="instance"
  >
    <div
      ref="self"
      :class="{
        selected
      }"
      :style="{
        paddingLeft: depth * 15 + 'px'
      }"
      class="self selectable-item"
      @click.stop="select"
      @dblclick.stop="toggle"
      @mouseenter="enter"
      @mouseleave="leave"
    >
      <!-- Component tag -->
      <span class="content">
        <!-- arrow wrapper for better hit box -->
        <span
          v-if="instance.children.length"
          class="arrow-wrapper"
          @click.stop="toggle"
        >
          <span
            :class="{ rotated: expanded }"
            class="arrow right"
          />
        </span>

        <span class="angle-bracket">&lt;</span>

        <span class="item-name">{{ displayName }}</span>

        <span
          v-if="componentHasKey"
          class="attr"
        >
          <span class="attr-title"> key</span>=<span class="attr-value">{{ instance.renderKey }}</span>
        </span>

        <span class="angle-bracket">&gt;</span>
      </span>
      <span
        v-if="instance.consoleId"
        v-tooltip="$t('ComponentInstance.consoleId.tooltip', { id: instance.consoleId })"
        class="info console"
      >
        = {{ instance.consoleId }}
      </span>
      <span
        v-if="instance.isRouterView"
        class="info router-view"
      >
        router-view{{ instance.matchedRouteSegment ? ': ' + instance.matchedRouteSegment : null }}
      </span>
      <span
        v-if="instance.isFragment"
        class="info fragment"
      >
        fragment
      </span>
      <span
        v-if="instance.functional"
        class="info functional"
      >
        functional
      </span>
      <span
        v-if="instance.inactive"
        class="info inactive"
      >
        inactive
      </span>

      <span class="spacer" />

      <VueIcon
        v-tooltip="'Scroll into view'"
        class="icon-button"
        icon="visibility"
        @click="scrollToInstance"
      />
    </div>

    <div v-if="expanded">
      <component-instance
        v-for="child in sortedChildren"
        :key="child.id"
        :instance="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { getComponentDisplayName, scrollIntoView, UNDEFINED } from '@utils/util'

export default {
  name: 'ComponentInstance',

  props: {
    instance: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      required: true
    }
  },

  computed: {
    ...mapState('components', [
      'expansionMap',
      'inspectedInstance',
      'inspectedInstanceId',
      'scrollToExpanded'
    ]),

    expanded () {
      return !!this.expansionMap[this.instance.id]
    },

    selected () {
      return this.instance.id === this.inspectedInstanceId
    },

    sortedChildren () {
      return this.instance.children.slice().sort((a, b) => {
        return a.top === b.top
          ? a.id - b.id
          : a.top - b.top
      })
    },

    displayName () {
      return getComponentDisplayName(this.instance.name, this.$shared.componentNameStyle)
    },

    componentHasKey () {
      return (this.instance.renderKey === 0 || !!this.instance.renderKey) && this.instance.renderKey !== UNDEFINED
    }
  },

  watch: {
    scrollToExpanded: {
      handler (value, oldValue) {
        if (value !== oldValue && value === this.instance.id) {
          this.scrollIntoView()
        }
      },
      immediate: true
    }
  },

  created () {
    // expand root by default
    if (this.depth === 0) {
      this.expand()
    }
  },

  methods: {
    ...mapMutations('components', {
      inspectInstance: 'INSPECT_INSTANCE'
    }),

    toggle (event) {
      this.toggleWithValue(!this.expanded, event.altKey)
    },

    expand () {
      this.toggleWithValue(true)
    },

    collapse () {
      this.toggleWithValue(false)
    },

    toggleWithValue (val, recursive = false) {
      this.$store.dispatch('components/toggleInstance', {
        instance: this.instance,
        expanded: val,
        recursive
      })
    },

    select () {
      this.inspectInstance(this.instance)
      bridge.send('select-instance', this.instance.id)
    },

    enter () {
      bridge.send('enter-instance', this.instance.id)
    },

    leave () {
      bridge.send('leave-instance', this.instance.id)
    },

    scrollToInstance () {
      bridge.send('scroll-to-instance', this.instance.id)
    },

    scrollIntoView (center = true) {
      this.$nextTick(() => {
        scrollIntoView(this.$globalRefs.leftScroll, this.$refs.self, center)
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.instance
  font-family dejavu sans mono, monospace
  .platform-mac &
    font-family Menlo, monospace
  .platform-windows &
    font-family Consolas, Lucida Console, Courier New, monospace
  &.inactive
    opacity .5

.self
  cursor pointer
  position relative
  z-index 2
  border-radius 3px
  font-size 14px
  line-height 22px
  height 22px
  white-space nowrap
  display flex
  align-items center
  padding-right 6px
  transition font-size .15s, height .15s

  &:hidden
    display none

  .high-density &
    font-size 12px
    height 15px

.children
  position relative
  z-index 1

.content
  position relative
  padding-left 22px

.info
  color #fff
  font-size 10px
  padding 3px 5px 2px
  display inline-block
  line-height 10px
  border-radius 3px
  position relative
  top -1px
  .high-density &
    padding 1px 4px 0
    top 0
  &.console
    color #fff
    background-color transparent
    top 0
  &.router-view
    background-color #ff8344
  &.fragment
    background-color #b3cbf7
  &.inactive
    background-color #aaa
  &.functional
    background-color rgba($md-black, .06)
    color: rgba($md-black, .5)
    .vue-ui-dark-mode &
      background-color rgba($md-white, .06)
      color rgba($md-white, .5)
  &:not(.console)
    margin-left 6px

.arrow-wrapper
  position absolute
  display inline-block
  width 16px
  height 16px
  top 1px
  left 4px

.arrow
  position absolute
  top 5px
  left 4px
  transition transform .1s ease
  &.rotated
    transform rotate(90deg)

.angle-bracket
  color $darkGrey

.item-name
  color $component-color
  margin 0 1px

.attr
  opacity .5
  font-size 12px
  .high-density &
    font-size 10px

.attr-title
  color purple
  .vue-ui-dark-mode &
    color lighten(purple, 60%)

.spacer
  flex auto 1 1

.icon-button
  width 16px
  height 16px

  .self:not(:hover) &
    visibility hidden

  .self.selected & >>> svg
    fill $white

.self:not(.selected)
  .info
    &.console
      color lighten(black, 80%)
      .vue-ui-dark-mode &
        color darken(white, 70%)

.self.selected
  .attr
    opacity 1
  .attr-title
    color lighten($purple, 70%)
  .info.functional
    color $md-white
</style>
