import { debounce as lodashDebounce, type DebouncedFunc } from 'lodash-es'
import type { Directive } from 'vue'

interface ElType extends HTMLElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _debounce?: DebouncedFunc<any>
}

const debounce: Directive = {
  mounted(el: ElType, { value, arg }: DirectiveBinding) {
    el._debounce = lodashDebounce(value, arg ? Number(arg) : 1000)

    el.addEventListener('click', el._debounce)
  },
  beforeUnmount(el: ElType) {
    el.removeEventListener('click', el?._debounce!.cancel)
  }
}

export default debounce
