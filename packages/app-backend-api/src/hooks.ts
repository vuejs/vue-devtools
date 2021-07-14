import { hasPluginPermission, PluginPermission } from '@vue-devtools/shared-utils'
import { Hooks, HookPayloads, Hookable, HookHandler } from '@vue/devtools-api'
import { BackendContext } from './backend-context'
import { Plugin } from './plugin'

type Handler<TPayload> = HookHandler<TPayload, BackendContext>

export interface HookHandlerData<THandlerPayload> {
  handler: Handler<THandlerPayload>
  plugin: Plugin
}

export class DevtoolsHookable implements Hookable<BackendContext> {
  private handlers: Partial<{ [eventType in Hooks]: HookHandlerData<HookPayloads[eventType]>[] }> = {}
  private ctx: BackendContext
  private plugin: Plugin

  constructor (ctx: BackendContext, plugin: Plugin = null) {
    this.ctx = ctx
    this.plugin = plugin
  }

  private hook<T extends Hooks> (eventType: T, handler: Handler<HookPayloads[T]>, pluginPermision: PluginPermission = null) {
    const handlers = (this.handlers[eventType] = this.handlers[eventType] || []) as HookHandlerData<HookPayloads[T]>[]

    if (this.plugin) {
      const originalHandler = handler
      handler = (...args) => {
        // Plugin permission
        if (!hasPluginPermission(this.plugin.descriptor.id, PluginPermission.ENABLED) ||
          (pluginPermision && !hasPluginPermission(this.plugin.descriptor.id, pluginPermision))
        ) return

        // App scope
        if (!this.plugin.descriptor.disableAppScope &&
          this.ctx.currentAppRecord.options.app !== this.plugin.descriptor.app) return
        return originalHandler(...args)
      }
    }

    handlers.push({
      handler,
      plugin: this.ctx.currentPlugin
    })
  }

  async callHandlers<T extends Hooks> (eventType: T, payload: HookPayloads[T], ctx: BackendContext) {
    if (this.handlers[eventType]) {
      const handlers = this.handlers[eventType] as HookHandlerData<HookPayloads[T]>[]
      for (let i = 0; i < handlers.length; i++) {
        const { handler, plugin } = handlers[i]
        try {
          await handler(payload, ctx)
        } catch (e) {
          console.error(`An error occurred in hook ${eventType}${plugin ? ` registered by plugin ${plugin.descriptor.id}` : ''}`)
          console.error(e)
        }
      }
    }
    return payload
  }

  transformCall (handler: Handler<HookPayloads[Hooks.TRANSFORM_CALL]>) {
    this.hook(Hooks.TRANSFORM_CALL, handler)
  }

  getAppRecordName (handler: Handler<HookPayloads[Hooks.GET_APP_RECORD_NAME]>) {
    this.hook(Hooks.GET_APP_RECORD_NAME, handler)
  }

  getAppRootInstance (handler: Handler<HookPayloads[Hooks.GET_APP_ROOT_INSTANCE]>) {
    this.hook(Hooks.GET_APP_ROOT_INSTANCE, handler)
  }

  registerApplication (handler: Handler<HookPayloads[Hooks.REGISTER_APPLICATION]>) {
    this.hook(Hooks.REGISTER_APPLICATION, handler)
  }

  walkComponentTree (handler: Handler<HookPayloads[Hooks.WALK_COMPONENT_TREE]>) {
    this.hook(Hooks.WALK_COMPONENT_TREE, handler, PluginPermission.COMPONENTS)
  }

  visitComponentTree (handler: Handler<HookPayloads[Hooks.VISIT_COMPONENT_TREE]>) {
    this.hook(Hooks.VISIT_COMPONENT_TREE, handler, PluginPermission.COMPONENTS)
  }

  walkComponentParents (handler: Handler<HookPayloads[Hooks.WALK_COMPONENT_PARENTS]>) {
    this.hook(Hooks.WALK_COMPONENT_PARENTS, handler, PluginPermission.COMPONENTS)
  }

  inspectComponent (handler: Handler<HookPayloads[Hooks.INSPECT_COMPONENT]>) {
    this.hook(Hooks.INSPECT_COMPONENT, handler, PluginPermission.COMPONENTS)
  }

  getComponentBounds (handler: Handler<HookPayloads[Hooks.GET_COMPONENT_BOUNDS]>) {
    this.hook(Hooks.GET_COMPONENT_BOUNDS, handler, PluginPermission.COMPONENTS)
  }

  getComponentName (handler: Handler<HookPayloads[Hooks.GET_COMPONENT_NAME]>) {
    this.hook(Hooks.GET_COMPONENT_NAME, handler, PluginPermission.COMPONENTS)
  }

  getComponentInstances (handler: Handler<HookPayloads[Hooks.GET_COMPONENT_INSTANCES]>) {
    this.hook(Hooks.GET_COMPONENT_INSTANCES, handler, PluginPermission.COMPONENTS)
  }

  getElementComponent (handler: Handler<HookPayloads[Hooks.GET_ELEMENT_COMPONENT]>) {
    this.hook(Hooks.GET_ELEMENT_COMPONENT, handler, PluginPermission.COMPONENTS)
  }

  getComponentRootElements (handler: Handler<HookPayloads[Hooks.GET_COMPONENT_ROOT_ELEMENTS]>) {
    this.hook(Hooks.GET_COMPONENT_ROOT_ELEMENTS, handler, PluginPermission.COMPONENTS)
  }

  editComponentState (handler: Handler<HookPayloads[Hooks.EDIT_COMPONENT_STATE]>) {
    this.hook(Hooks.EDIT_COMPONENT_STATE, handler, PluginPermission.COMPONENTS)
  }

  getComponentDevtoolsOptions (handler: Handler<HookPayloads[Hooks.GET_COMPONENT_DEVTOOLS_OPTIONS]>) {
    this.hook(Hooks.GET_COMPONENT_DEVTOOLS_OPTIONS, handler, PluginPermission.COMPONENTS)
  }

  getComponentRenderCode (handler: Handler<HookPayloads[Hooks.GET_COMPONENT_RENDER_CODE]>) {
    this.hook(Hooks.GET_COMPONENT_RENDER_CODE, handler, PluginPermission.COMPONENTS)
  }

  inspectTimelineEvent (handler: Handler<HookPayloads[Hooks.INSPECT_TIMELINE_EVENT]>) {
    this.hook(Hooks.INSPECT_TIMELINE_EVENT, handler, PluginPermission.TIMELINE)
  }

  timelineCleared (handler: Handler<HookPayloads[Hooks.TIMELINE_CLEARED]>) {
    this.hook(Hooks.TIMELINE_CLEARED, handler, PluginPermission.TIMELINE)
  }

  getInspectorTree (handler: Handler<HookPayloads[Hooks.GET_INSPECTOR_TREE]>) {
    this.hook(Hooks.GET_INSPECTOR_TREE, handler, PluginPermission.CUSTOM_INSPECTOR)
  }

  getInspectorState (handler: Handler<HookPayloads[Hooks.GET_INSPECTOR_STATE]>) {
    this.hook(Hooks.GET_INSPECTOR_STATE, handler, PluginPermission.CUSTOM_INSPECTOR)
  }

  editInspectorState (handler: Handler<HookPayloads[Hooks.EDIT_INSPECTOR_STATE]>) {
    this.hook(Hooks.EDIT_INSPECTOR_STATE, handler, PluginPermission.CUSTOM_INSPECTOR)
  }
}
