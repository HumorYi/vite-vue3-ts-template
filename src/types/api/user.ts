export interface UserRoute {
  path: string
  children?: UserRoute[]
}

export interface UserRes {
  id: number
  name: string
  routes: UserRoute[]
  role?: string
  feature ?: Record<string, {
    create ?: boolean
    del ?: boolean
    update ?: boolean
    view ?: boolean
  }>
}
