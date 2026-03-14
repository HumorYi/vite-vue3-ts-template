import { useEventListener } from '@vueuse/core'
import { clamp } from 'lodash-es'

export function draggable(el: HTMLElement, container?: HTMLElement) {
  let isDragging = false
  let mouseX = 0
  let mouseY = 0
  let minX = 0
  let maxX = 0
  let minY = 0
  let maxY = 0
  let initTranslateX = 0
  let initTranslateY = 0

  function initStyle() {
    window.requestAnimationFrame(() => {
      el.style.cursor = 'move'
      el.style.userSelect = 'none'

      el.style.transform ??= 'translate(0, 0)'
    })
  }

  function onmousedown(e: MouseEvent) {
    e.preventDefault()

    if (!isMouseLeft(e) || isDragging) return

    const elRect = el.getBoundingClientRect()

    // 解析当前 transform 的偏移值（兼容初始已有偏移的情况）
    const matrix = new DOMMatrix(window.getComputedStyle(el).transform)
    initTranslateX = matrix.e
    initTranslateY = matrix.f

    mouseX = e.clientX
    mouseY = e.clientY

    if (container) {
      const parentRect = container.getBoundingClientRect()

      maxX = parentRect.width - elRect.width
      maxY = parentRect.height - elRect.height
    } else {
      const { offsetLeft, offsetTop } = el
      const { clientWidth, clientHeight, scrollLeft, scrollTop } =
        document.documentElement

      minX = -offsetLeft + scrollLeft
      minY = -offsetTop + scrollTop
      maxX = clientWidth - elRect.width - offsetLeft + scrollLeft
      maxY = clientHeight - elRect.height - offsetTop + scrollTop
    }

    isDragging = true

    document.addEventListener('mousemove', onmousemove)
    document.addEventListener('mouseup', onmouseup)
  }

  function onmousemove(e: MouseEvent) {
    const x = clamp(initTranslateX + e.clientX - mouseX, minX, maxX)
    const y = clamp(initTranslateY + e.clientY - mouseY, minY, maxY)

    window.requestAnimationFrame(() => {
      el.style.transform = `translate(${x}px, ${y}px)`
    })
  }

  function onmouseup() {
    isDragging = false

    document.removeEventListener('mousemove', onmousemove)
    document.removeEventListener('mouseup', onmouseup)
  }

  initStyle()

  useEventListener(el, 'mousedown', onmousedown)
}

export function isMouseLeft(e: Event | TouchEvent) {
  return e.type === 'mousedown' && 'button' in e && e.button === 0
}
