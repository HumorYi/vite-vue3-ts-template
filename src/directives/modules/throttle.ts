import type { Directive } from 'vue'

import { useEventListener } from '@vueuse/core'
import { throttle as lodashThrottle } from 'lodash'

const throttle: Directive = {
  mounted(el: HTMLElement, { value, arg }: DirectiveBinding) {
    useEventListener(
      el,
      'click',
      lodashThrottle(value, arg ? Number(arg) : 300)
    )
  }
}

export default throttle
