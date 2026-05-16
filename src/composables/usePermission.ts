import type { RouteLocationRaw } from 'vue-router'

export function usePermissionPage(to: RouteLocationRaw) {
  return useUserStore().hasPermissionPage(to)
}

export function usePermissionFeatureCreate(name: string) {
  return useUserStore().hasPermissionFeature(name, 'create')
}

export function usePermissionFeatureDel(name: string) {
  return useUserStore().hasPermissionFeature(name, 'del')
}

export function usePermissionFeatureUpdate(name: string) {
  return useUserStore().hasPermissionFeature(name, 'update')
}

export function usePermissionFeatureView(name: string) {
  return useUserStore().hasPermissionFeature(name, 'view')
}
