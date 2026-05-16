import 'vue-router'

// 仅定义类型，不修改只读特性
declare module 'vue-router' {
  interface RouteMeta {
    groups?: string[]
  }
}
