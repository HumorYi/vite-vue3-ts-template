import type { Directive } from 'vue'

import type { DebouncedFuncLeading } from 'lodash'
import { throttle as lodashThrottle } from 'lodash-es'

interface ElType extends HTMLElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _throttle?: DebouncedFuncLeading<any>
}

const throttle: Directive = {
  mounted(el: ElType, { value, arg }: DirectiveBinding) {
    el._throttle = lodashThrottle(value, arg ? Number(arg) : 1000)

    el.addEventListener('click', el._throttle)
  },
  beforeUnmount(el: ElType) {
    el.removeEventListener('click', el?._throttle!.cancel)
  }
}

export default throttle
