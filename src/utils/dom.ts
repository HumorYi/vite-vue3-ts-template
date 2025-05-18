import { clamp } from 'lodash-es'

export function draggable(el: HTMLElement, container?: HTMLElement) {
  const parent = (container || document.body) as HTMLElement
  let originalX = 0
  let originalY = 0
  let mouseX = 0
  let mouseY = 0
  let elRect: DOMRect
  let parentRect: DOMRect

  //减少重绘和回流
  window.requestAnimationFrame(() => {
    el.style.cursor = 'move'
    el.style.position = 'absolute'
    el.style.userSelect = 'none'
  })

  function onmousedown(e: MouseEvent) {
    elRect = el.getBoundingClientRect()
    parentRect = parent.getBoundingClientRect()

    originalX = el.offsetLeft
    originalY = el.offsetTop

    mouseX = e.clientX
    mouseY = e.clientY

    document.addEventListener('mousemove', onmousemove)
    document.addEventListener('mouseup', onmouseup)
  }

  function onmousemove(e: MouseEvent) {
    const diffX = e.clientX - mouseX
    const diffY = e.clientY - mouseY

    const left = originalX + diffX
    const top = originalY + diffY

    const leftMax = parentRect.width - elRect.width
    const leftMin = 0

    const topMax = parentRect.height - elRect.height
    const topMin = 0

    //减少重绘和回流
    window.requestAnimationFrame(() => {
      el.style.left = clamp(left, leftMin, leftMax) + 'px'
      el.style.top = clamp(top, topMin, topMax) + 'px'
    })
  }

  function onmouseup() {
    document.removeEventListener('mousemove', onmousemove)
    document.removeEventListener('mouseup', onmouseup)
  }

  el.addEventListener('mousedown', onmousedown)
}
