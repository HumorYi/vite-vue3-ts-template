import type { Directive } from 'vue'

const validate: Directive = {
  mounted(el: HTMLElement, { value }: DirectiveBinding) {
    if (typeof value !== 'function') {
      throw 'callback must be a function'
    }

    el.addEventListener('blur', e => {
      const hasValue = value((e.target as HTMLInputElement).value)

      el.classList.add(hasValue ? 'is-valid' : 'is-invalid')
      el.classList.remove(hasValue ? 'is-invalid' : 'is-valid')
    })
  }
}

export default validate
