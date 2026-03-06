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
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import compression from 'vite-plugin-compression'
/* 生产环境 E */

/* PC 端 S */
import {
  ElementPlusResolver,
  AntDesignVueResolver
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

const cdnUrl = 'https://unpkg.com'

const cdnModules: any[] = [
  // 基础库
  {
    name: 'vue',
    var: 'Vue',
    path: 'dist/vue.global.prod.js',
    children: [
      {
        name: 'vue-router',
        var: 'VueRouter',
        path: 'dist/vue-router.global.prod.js'
      },
      { name: 'vue3-lazyload', var: 'VueLazyLoad', path: 'dist/index.min.js' },
      {
        name: 'pinia',
        var: 'Pinia',
        path: 'dist/pinia.iife.prod.js',
        children: [
          {
            name: 'pinia-plugin-persistedstate',
            var: 'piniaPluginPersistedstate',
            path: 'dist/index.umd.js'
          }
        ]
      }
    ]
  },
  { name: 'axios', var: 'axios', path: 'dist/axios.min.js' },
  { name: 'qs', var: 'Qs', path: 'dist/qs.js' },
  { name: 'dompurify', var: 'Dompurify', path: 'dist/purify.min.js' },
  // lodash-es 无法 umd，改用 lodash
  { name: 'lodash', var: '_', path: 'lodash.min.js' }

  // 其他常用库

  // 有需要自行开启，下载源包放在 public/libs 目录下 S
  // { name: 'dayjs', var: 'dayjs', path: 'dayjs.min.js' },
  // { name: 'vue-i18n', var: 'VueI18n', path: 'dist/vue-i18n.global.prod.js' }
  // 有需要自行开启，下载源包放在 public/libs 目录下 E
]

const dependenciesNames = Object.keys(dependencies)
const includeCdnModules = getIncludeCdnModules(cdnModules)

function getPkgVersion(pkgName: string) {
  const deps = dependencies as Record<string, string> | undefined

  return (deps?.[pkgName] || '').replace(/^[\^~]/, '')
}

function getIncludeCdnModules(arr: Record<string, any>[]) {
  const res = []

  arr.forEach(mod => {
    if (dependenciesNames.includes(mod.name)) {
      const obj: Record<string, any> = {
        ...mod,
        path:
          mod.prodUrl ||
          `${cdnUrl}/${mod.name}@${getPkgVersion(mod.name)}/${mod.path}`
      }

      if (obj.children?.length) {
        obj.children = getIncludeCdnModules(obj.children)
      }

      res.push(obj)
    }
  })

  return res
}

function getIncludeCdnNames(arr: Record<string, any>) {
  const res = []

  arr.forEach(mod => {
    res.push(mod.name)

    if (mod.children?.length) {
      res.push(...getIncludeCdnNames(mod.children))
    }
  })

  return res
}

function getIncludeCdnGlobals(arr: Record<string, any>) {
  const obj = {}

  arr.forEach(mod => {
    obj[mod.name] = mod.var

    if (mod.children?.length) {
      Object.assign(obj, getIncludeCdnGlobals(mod.children))
    }
  })

  return obj
}

function cdnPlugin() {
  return {
    name: 'cdn-plugin',
    // 转换 index.html 中的标签，注入 onerror 逻辑
    transformIndexHtml(html) {
      return html.replace(
        new RegExp(`<script.*?src="(./${assetsDir}/.*?\.js)"></script>`, 'g'),
        (match, entryUrl) => {
          if (!match) return match

          return `<script>
            const lastCdnModules = ${JSON.stringify(includeCdnModules)};

            function rollbackLocal(dep) {
              dep.path = \`/libs/\${dep.name}/\${dep.path.replace(/[^\\/]*\\//g, '')}\`;

              if (dep.children && dep.children.length) {
                dep.children.forEach(child => rollbackLocal(child))
              }
            }

            function loadScript(dep) {
              return new Promise((resolve, reject) => {
                const script = document.createElement('script');

                script.async = true;
                script.src = dep.path;

                script.setAttribute('crossorigin', 'anonymous');

                script.onerror = () => {
                  if (dep.path.startsWith('/libs')) {
                    reject(new Error(\`❌ 本地加载\${dep.name}失败\`))
                  }
                  else {
                    document.head.removeChild(script);

                    rollbackLocal(dep)

                    console.warn(\`⚠️ CDN加载\${dep.name}失败，回退本地: \${dep.path}\`);

                    loadScript(dep).then(() => resolve()).catch(err => reject(err));
                  }
                };

                script.onload = () => {
                  // 加载子依赖
                  if (dep.children && dep.children.length) {
                    Promise.all(dep.children.map(child => loadScript(child)))
                      .then(() => resolve())
                      .catch(err => reject(err));
                  } else {
                    resolve()
                  }
                };

                document.head.appendChild(script);
              });
            }

            async function initApp() {
              try {
                // 加载所有依赖
                await Promise.all(lastCdnModules.map(dep => loadScript(dep)))

                // 加载入口脚本（适配开发/生产环境）
                const entryScript = document.createElement('script');

                entryScript.type = "module"
                entryScript.src = '${entryUrl}';

                document.head.appendChild(entryScript);
                console.log('🚀 所有依赖加载完成，入口脚本已启动');
              } catch (err) {
                console.error('❌ 初始化失败:', err);
              }
            }

            initApp();
          </script>`
        }
      )
    }
  }
}

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
      dirs: ['src/components'],
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
    cdnPlugin(),
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
      cssMinify: 'lightningcss',
      // 分包核心配置，使用 rollup 将会 替代 assetsDir，需手动指定目录
      rollupOptions: {
        external: getIncludeCdnNames(includeCdnModules),
        output: {
          // 明确指定格式为 umd，确保全局变量生效
          format: 'umd',
          globals: getIncludeCdnGlobals(includeCdnModules),
          entryFileNames: `${assetsDir}/js/[name]-[hash].js`,
          chunkFileNames: `${assetsDir}/js/[name]-[hash].js`,
          assetFileNames: `${assetsDir}/[ext]/[name]-[hash].[ext]`
        }
      }
    },
    define: { __APP_INFO__: JSON.stringify(__APP_INFO__), ...envMeta },
    optimizeDeps: {
      include: isDev ? getIncludeCdnNames(includeCdnModules) : []
    }
  }
})
