import { useInterval, useTimeout } from '@vueuse/core'
import type { Directive } from 'vue'

const blinkAnimationStyle = `
  @keyframes typewriter-blink {
    to {
      visibility: hidden
    }
  }

  .typewriter-cursor:after {
    -webkit-animation: typewriter-blink 1s steps(5, start) infinite;
    animation: typewriter-blink 1s steps(5, start) infinite;
    content: "_";
    margin-left: .25rem;
    vertical-align: baseline
  }
`

const addStylesOnce = (() => {
  const style = document.createElement('style')

  return (css: string, id: string) => {
    const head = document.head

    if (head.querySelector(`#${id}`) || head.contains(style)) return

    style.appendChild(document.createTextNode(css))

    head.appendChild(style)
  }
})()

// 一段文字
const typewriter: Directive = {
  mounted(el: HTMLElement) {
    // css -> 模拟光标
    addStylesOnce(blinkAnimationStyle, 'v-typewriter-animation')

    // js -> DOM文字的显示 -> 计时器来进行定时执行
    // 1.拿到DOM中的文字text -> 总长度
    const text = el.innerText
    const children = el.children

    const run = (elem: Element, txt: string, cb?: () => void) => {
      elem.classList.add('typewriter-cursor')

      // 2.设置一个随机数random，长度小于上面的文本长度
      const random = Math.floor(Math.random() * txt.length)

      elem.textContent = txt

      // 3.删除text中random个字符，每隔200ms删除一个，直到删除random个
      const { pause } = useInterval(200, {
        controls: true,
        callback: () => {
          elem.textContent = elem.textContent!.substring(
            0,
            elem.textContent!.length - 1
          )

          if (elem.textContent.length !== random) return

          resume2()

          pause()
        }
      })


      const { start } = useTimeout(5000, {
        immediate: false,
        controls: true,
        callback: () => (typeof cb === 'function' ? cb() : run(elem, txt))
      })
      
      // 4.删除完成之后，每隔0.5s添加一个字符，直到添加完毕，这个是一个轮回。
      const { pause: pause2, resume: resume2 } = useInterval(500, {
        immediate: false,
        controls: true,
        callback: () => {
          elem.textContent += txt!.charAt(elem.textContent!.length)

          if (elem.textContent!.length !== txt.length) return

          pause2()

          elem.classList.remove('typewriter-cursor')

          start()
        }
      })
    }

    const runChildren = () => {
      // children长度，随机一个数
      // 对随机的child执行run方法
      const random = Math.floor(Math.random() * children.length)
      const node = children[random]
      const textNode = node?.textContent

      if (textNode) run(node, textNode, runChildren)
    }

    if (text && children.length === 0) run(el, text)
    else runChildren()
  }
}

export default typewriter
