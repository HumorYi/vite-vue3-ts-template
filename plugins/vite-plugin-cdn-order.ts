/**
 * 实现思路：
 *  1、劫持 Vite 构建后的 index.html 内部 js 入口文件
 *  2、创建 script 标签，优先通过 cdn 加载模块
 *  3、监听 script 标签 的 onload 事件，成功后加载子模块
 *  4、监听 script 标签 的 onerror 事件，失败后加载本地模块
 *  5、所有模块加载完成，再加载 js 入口文件
 *  6、更改 Vite 构建选项 rollupOptions
 *        通过 external 改成外部引用，不会到本地
 *        通过 output.globals 将模块名称与全局变量匹配，通过 output.format 设置成 umd，确保模块全局变量生效
 */

type Module = {
  // 模块名称
  name: string
  // 模块全局变量名称
  var: string
  // cdn 地址，优先使用模块 cdn 地址
  cdnUrl?: string
  // cdn 路径，其次模块地址为：全局 cdn 地址 + cdn 路径
  cdnPath?: string
  // 本地 地址，优先使用模块 本地 地址
  localUrl?: string
  // 本地 路径，其次模块地址为：全局 本地 地址 + 本地 路径
  localPath?: string
  // 子模块，用于控制模块加载顺序，父模块加载完成后会加载子模块，保证子模块加载时有父模块
  children?: Module[]
}

type Option = {
  // 依赖模块列表
  modules: Module[]
  // 全局 cdn 地址
  cdnUrl?: string
  // 全局 本地 地址
  localUrl?: string
  // 同 Vite 打包后静态资源目录，用于获取打包后 index.html 内部 js 入口文件，保证所有依赖加载完成后才会加载 入口文件
  assetsDir?: string
  // rollup 格式，目前只支持明确指定格式为 umd，确保全局变量生效
  format?: 'umd'
}

function getExternal(arr: Module[]) {
  const res: string[] = []

  arr.forEach(mod => {
    res.push(mod.name)

    if (mod.children?.length) {
      res.push(...getExternal(mod.children))
    }
  })

  return res
}

function getGlobals(arr: Module[]) {
  const obj:Record<string, string> = {}

  arr.forEach(mod => {
    obj[mod.name] = mod.var

    if (mod.children?.length) {
      Object.assign(obj, getGlobals(mod.children))
    }
  })

  return obj
}

export default function vitePluginCdnOrder(option: Option) {
  const {
    cdnUrl,
    modules,
    localUrl = '/libs/',
    assetsDir = 'assets',
    format = 'umd'
  } = option

  return {
    name: 'vite-plugin-cdn-order',
    // 转换 index.html 中的标签，注入 onerror 逻辑
    transformIndexHtml(html: string) {
      return html.replace(
        new RegExp(`<script.*?src="(./${assetsDir}/.*?\.js)"></script>`, 'g'),
        (match, entryUrl) => {
          if (!match) return match

          return `<script>
            (function() {
              const modules = ${JSON.stringify(modules)};

              function rollbackLocal(mod) {
                mod.useLocal = true;
                mod.cdnUrl = mod.localUrl || '${localUrl ?? ''}' + mod.localPath;

                if (mod.children && mod.children.length) {
                  mod.children.forEach(child => rollbackLocal(child))
                }
              }

              function getUrl(mod) {
                const cndUrl = mod.cdnUrl || '${cdnUrl ?? ''}' + mod.cdnPath;
                const localUrl = mod.localUrl || '${localUrl ?? ''}' + mod.localPath;

                return mod.useLocal ? localUrl : cndUrl;
              }

              function loadScript(mod) {
                return new Promise((resolve, reject) => {
                  const script = document.createElement('script');
                  const url = getUrl(mod);

                  script.async = true;
                  script.src = url;

                  script.setAttribute('crossorigin', 'anonymous');

                  script.onerror = () => {
                    if (mod.useLocal) {
                      reject(new Error(\`❌ 本地加载 \${mod.name} 失败\`))
                    } else {
                      document.head.removeChild(script);

                      rollbackLocal(mod)

                      console.warn(\`⚠️ CDN 加载 \${mod.name} 失败，回退本地\`);

                      loadScript(mod).then(() => resolve()).catch(err => reject(err));
                    }
                  };

                  script.onload = () => {
                    // 加载子依赖
                    if (mod.children && mod.children.length) {
                      Promise.all(mod.children.map(loadScript)).then(resolve).catch(reject);
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
                  await Promise.all(modules.map(mod => loadScript(mod)))

                  // 加载入口脚本（适配开发/生产环境）
                  const entryScript = document.createElement('script');

                  entryScript.type = "module"
                  entryScript.src = '${entryUrl}';

                  document.head.appendChild(entryScript);

                  console.log('🚀 所有 cdn 依赖加载完成，入口脚本已启动');
                } catch (err) {
                  console.error('❌ 初始化失败:', err);
                }
              }

              initApp();
            })()
          </script>`
        }
      )
    },
    config(config: Record<string, any>, { command }: any) {
      if (command !== 'build') return

      config.build ??= {}

      config.build.rollupOptions ??= {}

      config.build.rollupOptions.external ??= []

      config.build.rollupOptions.output ??= {}

      config.build.rollupOptions.output.globals ??= {}

      const { rollupOptions } = config.build
      const { output } = rollupOptions

      rollupOptions.external = [
        ...new Set(rollupOptions.external.concat(getExternal(modules)))
      ]

      output.format = format

      output.globals = { ...output.globals, ...getGlobals(modules) }
    }
  }
}
