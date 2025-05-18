import type { App, Directive } from 'vue'

const list = import.meta.glob('./**/*.ts', {
  eager: true,
  import: 'default'
})

export default {
  install(app: App<Element>) {
    for (const key in list) {
      app.directive(
        key.replace(/(.*\/)*([^.]+).*/gi, '$2'),
        list[key] as Directive
      )
    }
  }
}
