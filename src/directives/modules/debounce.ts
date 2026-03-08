import { useEventListener } from '@vueuse/core'
import { debounce as lodashDebounce } from 'lodash'
import type { Directive } from 'vue'

const debounce: Directive = {
  mounted(el: HTMLElement, { value, arg }: DirectiveBinding) {
    useEventListener(
      el,
      'click',
      lodashDebounce(value, arg ? Number(arg) : 300)
    )
  }
}

export default debounce
