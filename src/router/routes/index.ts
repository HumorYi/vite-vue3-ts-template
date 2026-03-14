import type { RouteRecordRaw } from 'vue-router'

import auth from './auth'
import base from './base'
import error from './error'

import { detectRepeatRouteNameOrPath } from '@/utils/route'

const routes: RouteRecordRaw[] = [...base, ...auth, ...error]

detectRepeatRouteNameOrPath(routes)

export default routes
