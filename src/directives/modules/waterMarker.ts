/*
  给整个页面添加背景水印

  使用：设置水印文案，颜色，字体大小
  <div v-waterMarker="{text:'版权所有',textColor:'rgba(180, 180, 180, 0.4)'}"></div>
*/

import type { Directive } from 'vue'

function addWaterMarker(
  el: HTMLElement,
  text: string,
  textColor = 'rgba(180, 180, 180, 0.3)',
  font = '16px Microsoft JhengHei'
) {
  // 水印文字，父元素，字体，文字颜色
  const can: HTMLCanvasElement = document.createElement('canvas')

  can.width = 200
  can.height = 150
  can.style.display = 'none'

  const cans = can.getContext('2d') as CanvasRenderingContext2D
  cans.rotate((-20 * Math.PI) / 180)
  cans.font = font
  cans.fillStyle = textColor
  cans.textAlign = 'left'
  cans.textBaseline = 'middle' as CanvasTextBaseline
  cans.fillText(text, can.width / 10, can.height / 2)

  el.style.userSelect = 'none'
  el.appendChild(can)
  el.style.backgroundImage = 'url(' + can.toDataURL('image/png') + ')'
}

const waterMarker: Directive = {
  mounted(
    el: HTMLElement,
    { value: { text, textColor, font } }: DirectiveBinding
  ) {
    addWaterMarker(el, text, textColor, font)
  }
}

export default waterMarker
