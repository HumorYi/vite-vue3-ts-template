import type { Preset } from 'unocss'

type MyPresetOptions = {
  name?: string
}

export default function colorPreset(_options: MyPresetOptions): Preset {
  // console.log(options)

  return {
    name: 'color-preset',
    rules: [[/c-g/, () => ({ color: 'green' })]],
    variants: [
      // ...
    ]
    // 它支持您在根配置中拥有的大多数配置
  }
}
