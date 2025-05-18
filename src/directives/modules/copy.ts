// v-copy="data"  默认复制成功后弹出提示
// v-copy:silence="data" 不显示复制成功后的提示

import { useClipboard } from '@vueuse/core'
import type { Directive } from 'vue'

interface ElType extends HTMLElement {
  __handleClick: () => void
  copyData?: string
}

const copy: Directive = {
  mounted(el: ElType, { value, modifiers }: DirectiveBinding) {
    el.copyData = value

    const { copy } = useClipboard({ source: value })

    el.__handleClick = () => {
      copy(el.copyData as string)

      if (!modifiers.silence) console.log('复制成功')
    }

    el.addEventListener('click', el.__handleClick)
  },
  updated(el: ElType, { value }: DirectiveBinding) {
    el.copyData = value
  },
  beforeUnmount(el: ElType) {
    el.removeEventListener('click', el.__handleClick)
  }
}

export default copy
