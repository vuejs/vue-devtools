import { PluginDescriptor, SetupFunction } from '.'
import { HookHandler } from './api'

interface GlobalTarget {
  __VUE_DEVTOOLS_PLUGINS__: Array<{
    pluginDescriptor: PluginDescriptor
    setupFn: SetupFunction
  }>
}

export function getDevtoolsGlobalHook (): any {
  return (getTarget() as any).__VUE_DEVTOOLS_GLOBAL_HOOK__
}

export function getTarget (): GlobalTarget {
  // @ts-ignore
  return (typeof navigator !== 'undefined' && typeof window !== 'undefined')
    ? window
    : typeof global !== 'undefined'
      ? global
      : {}
}
