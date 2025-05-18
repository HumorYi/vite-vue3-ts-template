import { detectRepeatRouteNameOrPath } from '@/utils/route'
import type { RouteRecordRaw } from 'vue-router'
import base from './base'
import permission from './permission'
import error from './error'

const routes: RouteRecordRaw[] = [...base, ...permission, ...error]

detectRepeatRouteNameOrPath(routes)

export default routes
