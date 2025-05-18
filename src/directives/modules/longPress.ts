import type { Directive } from 'vue'

interface ElType extends HTMLElement {
  _unmounted?: () => void
}

const longPress: Directive = {
  mounted(el: ElType, { value, arg }: DirectiveBinding) {
    if (typeof value !== 'function') {
      throw 'callback must be a function'
    }

    // 定义变量
    let timer: NodeJS.Timeout | number | null = null

    // 创建计时器（ 2秒后执行函数 ）
    const start = (e: MouseEvent | TouchEvent) => {
      if (
        timer ||
        (e.type === 'mousedown' && 'button' in e && e.button !== 0)
      ) {
        return
      }

      timer = setTimeout(() => value(e), Number(arg) || 2000)
    }

    // 取消计时器
    const cancel = () => {
      if (!timer) return

      clearTimeout(timer)

      timer = null
    }

    // 添加事件监听器
    el.addEventListener('mousedown', start)
    el.addEventListener('touchstart', start)

    // 取消计时器
    el.addEventListener('click', cancel)
    el.addEventListener('mouseout', cancel)
    el.addEventListener('touchend', cancel)
    el.addEventListener('touchcancel', cancel)

    // 移除事件监听器

    el._unmounted = () => {
      el.removeEventListener('mousedown', start)
      el.removeEventListener('touchstart', start)
      el.removeEventListener('click', cancel)
      el.removeEventListener('mouseout', cancel)
      el.removeEventListener('touchend', cancel)
      el.removeEventListener('touchcancel', cancel)
    }
  },
  beforeUnmount: el => el?._unmounted()
}

export default longPress
