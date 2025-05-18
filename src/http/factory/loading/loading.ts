import { type LoadingOption } from '@/types/http'

export default class Loading {
  defaultMountDom: HTMLElement
  mountDom: HTMLElement
  defaultId: string
  id: string

  constructor() {
    this.defaultMountDom = document.body
    this.mountDom = this.defaultMountDom
    this.defaultId = 'g-loading-wrap'
    this.id = this.defaultId
  }

  open(option: LoadingOption = {}) {
    const {
      mountDom,
      id,
      type = 'small',
      className = '',
      message = ''
    } = option

    if (mountDom) {
      this.mountDom = mountDom
    }

    if (!this.mountDom) {
      console.error('open: not found loading mountDom')
      return
    }

    const dom = document.createElement('div')
    let generateDomFn = this[type as 'small' | 'gif']
    let normalClassName = 'g-poa-center'

    if (type === 'default' || !generateDomFn) {
      generateDomFn = this.default
      normalClassName = 'g-mask fixed'
    }

    dom.className = normalClassName + ' ' + className

    if (id) {
      this.id = id
    }

    dom.id = this.id

    const element = generateDomFn(message)

    if (typeof element === 'string') {
      dom.innerHTML = element
    } else {
      dom.appendChild(element)
    }

    this.mountDom.appendChild(dom)
  }

  close() {
    if (!this.mountDom) {
      console.error('close: not found loading mountDom')
      return
    }

    const dom = document.getElementById(this.id)

    if (dom) this.mountDom.removeChild(dom)

    if (this.mountDom !== this.defaultMountDom) {
      this.mountDom = this.defaultMountDom
    }

    if (this.id !== this.defaultId) {
      this.id = this.defaultId
    }
  }

  default(message = '') {
    return (
      '<div class="g-loading g-poa-center">' +
      '<div class="g-loading-outer g-spin-right"></div>' +
      '<div class="g-loading-inner g-spin-left"></div>' +
      (message ? '<p class="g-loading-message">' + message + '</p>' : '') +
      '</div>'
    )
  }

  small(message = '') {
    let liDomStr = ''
    for (let i = 0; i < 12; i++) {
      liDomStr += '<li class="g-spinner"></li>'
    }

    return (
      '<div class="g-loading-spinner">' +
      '<ul class="g-loading-spinner-list">' +
      liDomStr +
      '</ul>' +
      (message
        ? '<p class="g-loading-spinner-message">' + message + '</p>'
        : '') +
      '</div>'
    )
  }

  gif() {
    const img = document.createElement('img')

    img.src = new URL(
      '@/assets/images/loading/loading.gif',
      import.meta.url
    ).href

    return img
  }
}
