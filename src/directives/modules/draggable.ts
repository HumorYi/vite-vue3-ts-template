/*
  思路：
    1、设置需要拖拽的元素为 absolute。
    2、鼠标按下(onmousedown)时记录目标元素当前的 left 和 top 值。
    3、鼠标移动(onmousemove)时计算每次移动的横向距离和纵向距离的变化值，并改变元素的 left 和 top 值
    4、鼠标松开(onmouseup)时完成一次拖拽

  使用：在 Dom 上加上 v-draggable 即可
  <div v-draggable></div>
*/
import { draggable as draggableDom } from '@/utils/dom'
import type { Directive } from 'vue'

const draggable: Directive = {
  mounted(el, { modifiers }) {
    draggableDom(el, modifiers.parent ? el.parentNode : undefined)
  }
}

export default draggable
