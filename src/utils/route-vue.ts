/**
 * 为避免开发过程中路由 重名 / 重地址 等无意行为，对路由做一层检测封装
 * 后续关于路由的处理，调用此文件提供的方法
 */

import permissionRoutes from '@/router/routes/permission'

// 检测是否有 重名 / 重地址 路由，抛出异常提示
export function detectRepeatRouteVue(routes: Record<string, any>[]) {
  const paths: string[] = []
  const names: (string | symbol)[] = []

  function recursiveRoutes(
    routes: Record<string, any>[],
    parentPath: string = ''
  ) {
    for (const route of routes) {
      const routePath = (parentPath +=
        (route.path?.startsWith('/') ? '' : '/') + (route.path ?? ''))

      if (route.path) {
        if (paths.includes(routePath)) {
          console.error(route)
          throw new Error('有重复路由地址')
        }

        paths.push(routePath)
      }

      if (route.name) {
        if (names.includes(route.name)) {
          console.error(route)
          throw new Error('有重复路由名称')
        }

        names.push(route.name)
      }

      if (route.children?.length) recursiveRoutes(route.children, routePath)
    }
  }

  recursiveRoutes(routes)
}

export function hasRoutePermissionVue(name: string) {
  return Boolean(findRouteByName(permissionRoutes, name)?.meta?.permission)
}

function findRouteByName(
  routes: Record<string, any>[],
  name: string
): Record<string, any> | undefined {
  for (const route of routes) {
    if (route?.name === name) return route

    if (route.children?.length) {
      const result = findRouteByName(route.children, name)

      if (result) return result
    }
  }
}
