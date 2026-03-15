import type { RouteRecordRaw } from 'vue-router'

import auth from './auth'
import base from './base'
import error from './error'

import { detectRepeatRoute } from '@/utils/route'

const routes: RouteRecordRaw[] = [...base, ...auth, ...error]

detectRepeatRoute(routes)

export default routes
