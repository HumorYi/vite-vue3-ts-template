/**
 * 注意：
 *  1、增删改配置时，一定要一个一个来
 *    先验证开发及生产环境是否都成功，再验证下一个
 *    不要一下处理一堆，出问题都不一定知道从何排查起
 */

import path from 'path'
import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from 'vite'

/* 插件 S */

/* 增强开发体验 S */
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import ViteRestart from 'vite-plugin-restart'
/* 增强开发体验 E */

/** 打包优化 S */
import { analyzer } from 'vite-bundle-analyzer'
import viteCompression from 'vite-plugin-compression'
import viteImagemin from 'vite-plugin-imagemin'
/** 打包优化 E */

/* 插件 E */

import {
  dependencies,
  devDependencies,
  engines,
  name,
  version
} from './package.json'

const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, engines, name, version },
  buildTimestamp: Date.now()
}

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd())

  const isDev = mode === 'development'
  const isAnalyze = mode === 'analyze'
  const isProd = mode === 'production' || isAnalyze

  const plugins = [
    AutoImport({
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: ['vue'], // 暂定只自动导入 vue，避免导入其它的导致混乱
      dts: 'src/dts/auto-imports.d.ts'
    }),
    Components({
      deep: true,
      dirs: ['src/components'],
      dts: 'src/dts/components.d.ts'
    }),
    vue(),
    UnoCSS({ hmrTopLevelAwait: false })
  ]

  const devPlugins = [
    ViteRestart({
      restart: [
        'vite.config.[jt]s',
        'uno.config.[jt]s',
        'src/uno/**/*.ts',
        '.env*'
      ]
    })
  ]

  const prodPlugins = [
    viteCompression({ threshold: 10240 }),
    viteImagemin({
      gifsicle: { optimizationLevel: 7, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 20 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox' },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    })
  ]

  if (isDev) plugins.push(...devPlugins)
  else if (isProd) plugins.push(...prodPlugins)

  if (isAnalyze) plugins.push(analyzer())

  return {
    base: './',
    resolve: {
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.vue'],
      alias: { '@': path.resolve(__dirname, 'src') }
    },
    plugins,
    server: {
      host: '0.0.0.0',
      port: 8080,
      open: false,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          changeOrigin: true,
          target: env.VITE_APP_API_URL,
          rewrite: (path: string) =>
            path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
        }
      }
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({
            // 自动添加前缀
            overrideBrowserslist: [
              'Android 4.1',
              'iOS 7.1',
              'Chrome > 31',
              'ff > 31',
              'ie >= 8'
              //'last 2 versions', // 所有主流浏览器最近2个版本
            ]
          })
        ]
      },
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `
            @use "@/assets/styles/variables.scss" as variables;
            @use "@/assets/styles/mixins/index.scss" as mixins;
          `
        }
      },
      modules: { localsConvention: 'camelCase' }
    },
    build: {
      sourcemap: isProd,
      manifest: isProd,
      minify: isProd ? 'terser' : 'esbuild',
      cssMinify: 'lightningcss',
      terserOptions: {
        compress: { drop_console: isProd, drop_debugger: isProd }
      },
      // 使用 rollup 将会 替代 assetsDir，需手动指定目录
      rollupOptions: {
        output: {
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash][extname]'
        }
      }
    },
    define: { __APP_INFO__: JSON.stringify(__APP_INFO__) },
    optimizeDeps: { include: ['vue', 'lodash-es'] }
  }
})
