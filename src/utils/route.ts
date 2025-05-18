/**
 * 为避免开发过程中路由 重名 / 重地址 等无意行为，对路由做一层检测封装
 * 后续关于路由的处理，调用此文件提供的方法
 */

import { useRouter, type RouteRecordRaw } from 'vue-router'

// 检测是否有 重名 / 重地址 路由，抛出异常提示
export function detectRepeatRouteNameOrPath(routes: RouteRecordRaw[]) {
  const names: (string | symbol)[] = []
  const paths: string[] = []

  function recursiveRoutes(routes: RouteRecordRaw[], parent?: RouteRecordRaw) {
    for (const route of routes) {
      if (route.name && names.includes(route.name)) {
        console.error(route)
        throw new Error('有重复路由名称')
      }

      if (route.path && paths.includes(route.path)) {
        console.error(route)
        throw new Error('有重复路由地址')
      }

      if (route.name) names.push(route.name)
      if (route.path) paths.push((parent?.path || '') + route.path)

      if (route.children?.length) recursiveRoutes(route.children, route)
    }
  }

  recursiveRoutes(routes)
}

export function addRoutes(routes: RouteRecordRaw[]) {
  detectRepeatRouteNameOrPath(routes)

  const router = useRouter()

  for (const route of routes) {
    router.addRoute(route)
  }
}

export function addRoute(route: RouteRecordRaw) {
  addRoutes([route])
}

/**
 * 动态注入权限路由表，从配置好的路由表中取对应权限路由，再注册
 *
 * 优：关注点在路由表，有路由即有权限（初易后难）
 * 缺：
 *    1、用户登入登出需要反复 添加移除 权限路由表
 *    2、每次访问路由时，需检测该路由是否在路由表中
 *       如若不检测直接会跳404，用户会产生疑惑，为何之前进来有现在又无，以为系统出问题
 *       此情况出现在复制链接访问 或 浏览器书签点击访问
 *       如果没有权限，需要提示用户，并且跳回首页或指定页
 */
export function transformRoutes(
  routes: RouteRecordRaw[],
  permissions: RouteRecordRaw[]
): RouteRecordRaw[] {
  const lastRoutes: RouteRecordRaw[] = []

  return lastRoutes.concat(routes).concat(permissions)
}

/**
 * 默认注册权限路由表（初难后易）
 *
 * 优：
 *    1、关注点在权限，只需要设置权限，不需要反复 添加移除 权限路由表
 *    2、当用户 复制链接访问 或 浏览器书签点击访问时，只需检测是否有权限，并做对应处理
 * 缺：用户登入登出需要反复 开启改变 权限
 */
export function setRoutePermissionByDynamic(
  routes: RouteRecordRaw[],
  permissions: RouteRecordRaw[],
  field?: string
) {
  const _permissions = JSON.parse(JSON.stringify(permissions))

  for (const route of routes) {
    for (const [index, permission] of _permissions.entries()) {
      /**
       * 注意：此处以路由路径来匹配，而不是以路由名称
       *      在嵌套路由中需要默认显示根路由时，会配置子路由 path: ''
       *      将路由名称设置在此路由上，根路由是没有路由名称的
       *      若以路由名称来匹配，需要额外处理根路由默认显示相关嵌套逻辑
       */
      if (route.path !== permission.path) continue

      setPermission(route, true, field)

      if (permission.children?.length && route.children?.length) {
        setRoutePermissionByDynamic(route.children, permission.children, field)
      }

      _permissions.splice(index, 1)

      break
    }
  }
}

export function setRoutePermissionByRole(
  routes: RouteRecordRaw[],
  role: string,
  field?: string,
  parentRoute?: RouteRecordRaw
) {
  for (const route of routes) {
    let isSet = true

    /**
     * 如果当前路由配置角色，即指定角色才能访问；
     * 否则如果上层路由配置角色，即指定角色才能访问；
     * 否则都没有配置角色，即所有角色都能访问；
     */
    const roles = (route.meta?.roles || parentRoute?.meta?.roles) as string[]

    if (roles) {
      isSet = roles.includes(role)
    }

    if (isSet) setPermission(route, true, field)

    if (route.children?.length) {
      setRoutePermissionByRole(
        route.children,
        role,
        field,
        route.meta?.roles ? route : parentRoute
      )
    }
  }
}

export function setRoutePermissionByAuth(
  routes: RouteRecordRaw[],
  field?: string
) {
  for (const route of routes) {
    setPermission(route, true, field)

    if (route.children?.length) {
      setRoutePermissionByAuth(route.children, field)
    }
  }
}

export function resetRoutePermission(routes: RouteRecordRaw[], field?: string) {
  for (const route of routes) {
    setPermission(route, false, field)

    if (route.children?.length) resetRoutePermission(route.children, field)
  }
}

function setPermission(
  route: RouteRecordRaw,
  val: boolean,
  field = 'permission'
) {
  if (!route.meta) {
    route.meta = {}
  }

  route.meta[field] = val
}

export function findRouteByName(
  routes: RouteRecordRaw[],
  name: string
): RouteRecordRaw | undefined {
  for (const route of routes) {
    if (route?.name === name) return route

    if (route.children?.length) {
      const result = findRouteByName(route.children, name)

      if (result) return result
    }
  }
}

export function hasRoutePermission(routes: RouteRecordRaw[], name: string) {
  return Boolean(findRouteByName(routes, name)?.meta?.permission)
}
