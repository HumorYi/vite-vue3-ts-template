import { isMouseLeft } from '@/utils/dom'
import { useEventListener, useTimeout } from '@vueuse/core'
import type { Directive } from 'vue'

const longPress: Directive = {
  mounted(el: HTMLElement, { value, arg }: DirectiveBinding) {
    if (typeof value !== 'function') {
      throw 'callback must be a function'
    }

    const { start, stop } = useTimeout(Number(arg) || 2000, {
      immediate: false,
      controls: true,
      callback: value
    })

    // 创建计时器（ 2秒后执行函数 ）
    const handle = (e: MouseEvent | TouchEvent) => {
      if (!isMouseLeft(e)) return

      start()
    }

    // 添加事件监听器
    useEventListener(el, 'mousedown', handle)
    useEventListener(el, 'touchstart', handle)

    // 取消计时器
    useEventListener(el, 'click', stop)
    useEventListener(el, 'mouseout', stop)
    useEventListener(el, 'touchend', stop)
    useEventListener(el, 'touchcancel', stop)
  }
}

export default longPress
