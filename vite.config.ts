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
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import compression from 'vite-plugin-compression'
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
    ViteImageOptimizer({
      png: { quality: 60 },
      jpg: { quality: 70 },
      jpeg: { quality: 70 },
      webp: { quality: 70, lossless: false },
      avif: { quality: 70 },
      exclude: ['**/logo.svg']
    }),
    /*
    # 示例 Nginx 配置（优先返回 brotli，再返回 gzip，最后返回原始文件）
    # 开启 gzip 静态压缩包识别
    gzip_static on;
    # 开启 brotli 静态压缩包识别（需 Nginx 安装 brotli 模块）
    brotli_static on;
    # 设置响应头，告诉浏览器支持的压缩格式
    add_header Content-Encoding gzip always;
    */
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
        [env.VITE_APP_BASE_API]: {
          changeOrigin: true,
          target: env.VITE_APP_API_URL,
          rewrite: (path: string) =>
            path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
          // secure: false, // https接口需配置
          // ws: true, // 支持 websocket
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
      sourcemap: true,
      manifest: true,
      minify: 'terser',
      cssMinify: 'lightningcss',
      terserOptions: {
        compress: { drop_console: true, drop_debugger: true },
        format: { comments: false }
      },
      // 分包核心配置，使用 rollup 将会 替代 assetsDir，需手动指定目录
      rollupOptions: {
        output: {
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]'
        }
      }
    },
    define: { __APP_INFO__: JSON.stringify(__APP_INFO__) },
    // 优化依赖预构建（提升冷启动速度）
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'axios', 'lodash-es']
    }
  }
})
