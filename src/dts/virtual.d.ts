// src/types/virtual.d.ts
declare module 'virtual:meta-layouts' {
  import type { RouteRecordRaw } from 'vue-router'
  export const setupLayouts: (routes: RouteRecordRaw[]) => RouteRecordRaw[]
}
