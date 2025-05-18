import { createPinia } from 'pinia'
import piniaPluginPersist from 'pinia-plugin-persist'
import VueLazyLoad from 'vue3-lazyload'

import App from './App.vue'
import directives from './directives'
import router from './router'

import 'normalize.css'
import 'virtual:uno.css'
import './assets/styles/index.scss'

import { initEnvs } from './utils/envs'

import errorImg from '@/assets/images/lazyload/error.jpg'
import loadingImg from '@/assets/images/lazyload/loading.gif'

const app = createApp(App)
const pinia = createPinia().use(piniaPluginPersist)

initEnvs()

app
  .use(VueLazyLoad, { loading: loadingImg, error: errorImg })
  .use(pinia)
  .use(router)
  .use(directives)
  .mount('#app')

app.config.performance = true

app.config.errorHandler = (err, instance, info) => {
  // 向追踪服务报告错误
  console.error('errorHandler: ', err, instance, info)
}

app.config.warnHandler = (message, instance, trace) => {
  // `trace` 是组件层级结构的追踪
  console.warn('warnHandler: ', message, instance, trace)
}
