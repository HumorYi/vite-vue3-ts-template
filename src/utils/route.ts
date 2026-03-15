/**
 * 为避免开发过程中路由 重名 / 重地址 等无意行为，对路由做一层检测封装
 * 后续关于路由的处理，调用此文件提供的方法
 */
import { ROUTER_PERMISSION_TYPE, RouterPermission } from '@/config/route'
import permissionRoutes from '@/router/routes/permission'
import {detectRepeatRouteVue, hasRoutePermissionVue} from './route-vue'

export const detectRepeatRoute = detectRepeatRouteVue
export const hasRoutePermission = hasRoutePermissionVue

export function setRoutePermission(val: any) {
  switch (ROUTER_PERMISSION_TYPE) {
    case RouterPermission.DYNAMIC.valueOf():
      setRoutePermissionByDynamic(val as Record<string, any>[])
      break

    case RouterPermission.ROLE.valueOf():
      setRoutePermissionByRole(val as string)
      break

    case RouterPermission.AUTH.valueOf():
      setRoutePermissionByAuth()
      break

    default:
      break
  }
}

export function resetRoutePermission(
  routes: Record<string, any>[] = permissionRoutes
) {
  for (const route of routes) {
    setPermission(route, false)

    if (route.children?.length) resetRoutePermission(route.children)
  }
}

export function setRouteAuth(
  routes: Record<string, any>[],
  val: boolean = true
) {
  for (const route of routes) {
    route.meta ??= {}

    route.meta.auth = val

    if (route.children?.length) setRouteAuth(route.children)
  }
}

/**
 * 默认注册权限路由表（初难后易）
 *
 * 优：
 *    1、关注点在权限，只需要设置权限，不需要反复 添加移除 权限路由表
 *    2、当用户 复制链接访问 或 浏览器书签点击访问时，只需检测是否有权限，并做对应处理
 * 缺：用户登入登出需要反复 开启改变 权限
 */
function setRoutePermissionByDynamic(
  permissions: Record<string, any>[],
  routes: Record<string, any>[] = permissionRoutes
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

      setPermission(route, true)

      if (permission.children?.length && route.children?.length) {
        setRoutePermissionByDynamic(permission.children, route.children)
      }

      _permissions.splice(index, 1)

      break
    }
  }
}

function setRoutePermissionByRole(
  role: string,
  parentRoles?: string[],
  routes: Record<string, any>[] = permissionRoutes
) {
  for (const route of routes) {
    /**
     * 如果当前路由配置角色，即指定角色才能访问；
     * 否则如果上层路由配置角色，即指定角色才能访问；
     * 否则都没有配置角色，即所有角色都能访问；
     */
    const roles = route.meta?.roles || parentRoles

    setPermission(route, !roles || roles?.includes(role))

    if (route.children?.length) {
      setRoutePermissionByRole(role, roles, route.children)
    }
  }
}

function setRoutePermissionByAuth(
  routes: Record<string, any>[] = permissionRoutes
) {
  for (const route of routes) {
    setPermission(route, true)

    if (route.children?.length) {
      setRoutePermissionByAuth(route.children)
    }
  }
}

function setPermission(route: Record<string, any>, val: boolean) {
  route.meta ??= {}

  route.meta.permission = val
}
