// v-copy="data"  默认复制成功后弹出提示
// v-copy:silence="data" 不显示复制成功后的提示

import { useClipboard, useEventListener } from '@vueuse/core'
import type { Directive } from 'vue'

interface ElType extends HTMLElement {
  _copyData?: string
}

const copy: Directive = {
  mounted(el: ElType, { value, modifiers }: DirectiveBinding) {
    el._copyData = value

    const { copy } = useClipboard({ source: value })

    useEventListener(el, 'click', () => {
      copy(el._copyData as string)

      if (!modifiers.silence) console.log('复制成功')
    })
  },
  updated(el: ElType, { value }: DirectiveBinding) {
    el._copyData = value
  }
}

export default copy
