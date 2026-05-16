import type { Preset } from 'unocss'

type MyPresetOptions = {
  name?: string
}

export default function bgPreset(_options: MyPresetOptions): Preset {
  // console.log(options)

  return {
    name: 'bg-preset',
    rules: [[/bg-d/, () => ({ 'background-color': '#ddd' })]],
    variants: [
      // ...
    ]
    // 它支持您在根配置中拥有的大多数配置
  }
}
