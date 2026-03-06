import type { Directive } from 'vue'

import { throttle as lodashThrottle, type DebouncedFunc } from 'lodash'

interface ElType extends HTMLElement {
  _throttle?: DebouncedFunc<any>
}

const throttle: Directive = {
  mounted(el: ElType, { value, arg }: DirectiveBinding) {
    el._throttle = lodashThrottle(value, arg ? Number(arg) : 300)

    el.addEventListener('click', el._throttle)
  },
  beforeUnmount(el: ElType) {
    el.removeEventListener('click', el?._throttle!.cancel)
  }
}

export default throttle
