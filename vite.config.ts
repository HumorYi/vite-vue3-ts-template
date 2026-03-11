/**
 * 注意：
 *  1、增删改配置时，一定要一个一个来
 *    先验证开发及生产环境是否都成功，再验证下一个
 *    不要一下处理一堆，出问题都不一定知道从何排查起
 */
import path from 'path'
import {
  type ConfigEnv,
  type PluginOption,
  type UserConfig,
  defineConfig,
  loadEnv
} from 'vite'

/* 插件 S */

/* 通用环境 S */
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
/* 通用环境 E */

/* 开发环境 S */
import ViteRestart from 'vite-plugin-restart'
import vueDevTools from 'vite-plugin-vue-devtools'
/* 开发环境 E */

/* 生产环境 S */
import { analyzer } from 'vite-bundle-analyzer'
import compression from 'vite-plugin-compression'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

import vitePluginCdnOrder from './plugins/vite-plugin-cdn-order'
/* 生产环境 E */

/* PC 端 S */
import {
  AntDesignVueResolver,
  ElementPlusResolver
} from 'unplugin-vue-components/resolvers'
/* PC 端 E */

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

const assetsDir = 'assets'

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd())

  const isDev = mode === 'development'
  const isAnalyze = mode === 'analyze'
  const isProd = mode === 'production' || isAnalyze

  const envMeta = Object.entries(env).reduce((acc, [key, value]) => {
    // 只处理 VITE_ 开头的环境变量（Vite 仅暴露这类变量）
    if (key.startsWith('VITE_')) {
      acc[`import.meta.env.${key}`] = JSON.stringify(value)
    }

    return acc
  }, {})

  const plugins: PluginOption[] = [
    vue(),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: ['vue'], // 暂定只自动导入 vue，避免导入其它的导致混乱
      dts: 'src/dts/auto-imports.d.ts',
      resolvers: [ElementPlusResolver(), AntDesignVueResolver()]
    }),
    Components({
      deep: true,
      directoryAsNamespace: true,
      dirs: [
        'src/components/business/',
        'src/components/common/',
        'src/layouts/'
      ],
      dts: 'src/dts/components.d.ts',
      resolvers: [ElementPlusResolver(), AntDesignVueResolver()]
    }),
    UnoCSS({ hmrTopLevelAwait: false })
  ]

  const devPlugins: PluginOption[] = [
    ViteRestart({
      restart: [
        'vite.config.[jt]s',
        'uno.config.[jt]s',
        'src/uno/**/*.ts',
        '.env*'
      ]
    }),
    vueDevTools()
  ]

  const prodPlugins: PluginOption[] = [
    vitePluginCdnOrder({
      assetsDir,
      cdnUrl: 'https://unpkg1.com/',
      modules: [
        {
          name: 'vue',
          var: 'Vue',
          cdnPath: 'vue@3.5.14/dist/vue.global.prod.js',
          children: [
            {
              name: 'vue-router',
              var: 'VueRouter',
              cdnPath: 'vue-router@4.5.1/dist/vue-router.global.prod.js',
              localPath: 'vue-router/vue-router.global.prod.js'
            },
            {
              name: 'vue3-lazyload',
              var: 'VueLazyLoad',
              cdnPath: 'vue3-lazyload@0.3.8/dist/index.min.js',
              localPath: 'vue3-lazyload/index.min.js'
            },
            {
              name: 'pinia',
              var: 'Pinia',
              cdnPath: 'pinia@3.0.2/dist/pinia.iife.prod.js',
              children: [
                {
                  name: 'pinia-plugin-persistedstate',
                  var: 'piniaPluginPersistedstate',
                  cdnPath:
                    'pinia-plugin-persistedstate@4.7.1/dist/index.umd.js',
                  localPath: 'pinia-plugin-persistedstate/index.umd.js'
                }
              ],
              localPath: 'pinia/pinia.iife.prod.js'
            }
          ],
          localPath: 'vue/vue.global.prod.js'
        },
        {
          name: 'axios',
          var: 'axios',
          cdnPath: 'axios@1.9.0/dist/axios.min.js',
          localPath: 'axios/axios.min.js'
        },
        {
          name: 'qs',
          var: 'Qs',
          cdnPath: 'qs@6.14.0/dist/qs.js',
          localPath: 'qs/qs.js'
        },
        {
          name: 'dompurify',
          var: 'Dompurify',
          cdnPath: 'dompurify@3.3.1/dist/purify.min.js',
          localPath: 'dompurify/purify.min.js'
        },
        {
          name: 'lodash',
          var: '_',
          cdnPath: 'lodash@4.17.23/lodash.min.js',
          localPath: 'lodash/lodash.min.js'
        }
      ]
    }),
    ViteImageOptimizer({
      png: { quality: 60 },
      jpg: { quality: 70 },
      jpeg: { quality: 70 },
      webp: { quality: 70, lossless: false },
      avif: { quality: 70 },
      exclude: ['**/logo.svg']
    }),
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 10240 }),
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 10240 })
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
      cors: true,
      proxy: {
        [env.VITE_APP_API_BASE]: {
          // secure: false, // https接口需配置
          // ws: true, // 支持 websocket
          changeOrigin: true,
          target: env.VITE_APP_API_URL,
          rewrite: (path: string) =>
            path.replace(new RegExp('^' + env.VITE_APP_API_BASE), '')
        }
      },
      hmr: {
        overlay: false // 关闭热更新错误浮层（避免干扰开发）
      }
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({
            overrideBrowserslist: [
              'Android 4.1',
              'iOS 7.1',
              'Chrome > 31',
              'ff > 31',
              'ie >= 8'
            ]
          })
        ]
      },
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/styles/variables.scss" as variables;
            @use "@/assets/styles/mixins/index.scss" as mixins;
          `
        }
      },
      modules: { localsConvention: 'camelCase' }
    },
    build: {
      sourcemap: true,
      manifest: true,
      minify: 'terser',
      terserOptions: { compress: { drop_console: true, drop_debugger: true } },
      cssMinify: 'lightningcss',
      // 分包核心配置，使用 rollup 将会 替代 assetsDir，需手动指定目录
      rollupOptions: {
        output: {
          entryFileNames: `${assetsDir}/js/[name]-[hash].js`,
          chunkFileNames: `${assetsDir}/js/[name]-[hash].js`,
          assetFileNames: `${assetsDir}/[ext]/[name]-[hash].[ext]`
        }
      }
    },
    define: { __APP_INFO__: JSON.stringify(__APP_INFO__), ...envMeta }
  }
})
