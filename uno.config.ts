// import { preset } from './uno/preset'

/**
 * 样式规则互动工具
 *    https://unocss.dev/interactive/
 *
 * 查看具体样式编译后的文件
 *    http://localhost:8080/__unocss#/
 */
import presetRemToPx from "@unocss/preset-rem-to-px"
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup
} from "unocss"
import customPresets from "./src/uno/presets"
import customShortcuts from "./src/uno/shortcuts"

export default defineConfig({
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
    presetRemToPx({ baseFontSize: 4 }),
    ...customPresets
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
})
