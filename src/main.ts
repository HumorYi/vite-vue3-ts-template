import { createPinia } from 'pinia'
import piniaPluginPersist from 'pinia-plugin-persist'

import App from './App.vue'
import directives from './directives'
import router from './router'

import 'normalize.css'
import 'reset.css'
import 'virtual:uno.css'

import './styles/index.scss'

const pinia = createPinia()
const app = createApp(App)

pinia.use(piniaPluginPersist)

app.use(pinia).use(router).use(directives).mount('#app')

app.config.performance = true

app.config.errorHandler = (err, instance, info) => {
  // 向追踪服务报告错误
  console.error('errorHandler: ', err, instance, info)
}

app.config.warnHandler = (message, instance, trace) => {
  // `trace` 是组件层级结构的追踪
  console.warn('warnHandler: ', message, instance, trace)
}
