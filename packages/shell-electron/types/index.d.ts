import type { VueConstructor } from "vue";

interface ConnectOptions {
  io?: Function;
  showToast?: Function;
  app?: VueConstructor | VueConstructor[];
}

export function connect(
  host?: string,
  port?: number | string,
  options?: ConnectOptions
): void;

export function init(vue: VueConstructor | VueConstructor[]): void;
