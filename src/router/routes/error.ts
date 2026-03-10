import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  ...[
    { code: 403, tip: '抱歉，您无权访问该页面~🙅‍♂️🙅‍♀️', btn: '返回首页' },
    { code: 404, tip: '抱歉，您访问的页面不存在~🤷‍♂️🤷‍♀️', btn: '返回首页' },
    { code: 500, tip: '抱歉，登录超时，您的网络不见了~🤦‍♂️🤦‍♀️', btn: '重新登录' }
  ].map(route => ({
    path: `/${route.code}`,
    name: `${route.code}`,
    // 定制 UI
    // component: () => import(`@/pages/error/${route.code}.vue`),
    // 一套 UI
    component: () => import(`@/pages/error/Index.vue`),
    meta: { ...route, title: `${route.code} 页面` }
  })),
  // 解决刷新页面，路由警告
  { path: '/:pathMatch(.*)*', redirect: '/404' }
]

export default routes
