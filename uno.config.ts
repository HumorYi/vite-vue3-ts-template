// import { preset } from './uno/preset'

/**
 * 样式规则互动工具
 *    https://unocss.dev/interactive/
 *
 * 查看具体样式编译后的文件
 *    http://localhost:8080/__unocss#/
 */
import presetRemToPx from '@unocss/preset-rem-to-px'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

import customPresets from './src/uno/presets'
import customShortcuts from './src/uno/shortcuts'

export default defineConfig({
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // include js/ts files
        'src/**/*.{js,ts}'
      ]
      // exclude files
      // exclude: []
    }
  },
  shortcuts: {
    ...customShortcuts
  },
  theme: {
    colors: {}
  },
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // ...
      }
    }),
    presetRemToPx({ baseFontSize: 4 }) as any,
    ...customPresets
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()]
})
