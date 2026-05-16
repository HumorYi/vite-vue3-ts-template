import type { Plugin } from 'vite'
import path from 'node:path'

const FILENAME_REGEX = /[^/]+\.vue|[tj]sx?/
const USE_LANG_REGEX =
  /\b(useLangPage|useLangAuthPage|useLangAuthPermissionPage|useLangLayout|useLangComponent|useLangAdminPage|useLangFinancePage)\(\)/g
const GET_PRE_URL_REGEX = /\bgetPreUrl\(\)/g

export default function vitePluginReplaceCallerFilename(): Plugin {
  return {
    name: 'vite-plugin-replace-caller-filename',
    enforce: 'pre',
    transform(code, fileId) {
      // 1. 跳过定义文件、依赖包，防止误替换
      if (
        fileId.includes('node_modules') ||
        fileId.includes('composables/useLang.ts') ||
        fileId.includes('utils/replace-caller-filename.ts')
      ) {
        return code
      }

      // 2. 核心：剥离Vue虚拟模块 ? 参数，拿到真实源码路径
      const realPath = fileId.split('?')[0]
      // 只处理vue/js/jsx/ts/tsx/jsx源码文件
      if (!FILENAME_REGEX.test(realPath)) return code

      // 3. 提取纯文件名（default.vue → default）
      const filename = path.basename(realPath).split('.')[0]

      // 4. 🔥 双规则替换：同时处理 useLang 和 getPreUrl
      return (
        code
          // 规则1：useLang开头空括号 → 填充文件名
          .replace(USE_LANG_REGEX, `$1('${filename}')`)
          // 规则2：getPreUrl() → 替换为 /文件名
          .replace(GET_PRE_URL_REGEX, `'/${filename}'`)
      )
    }
  }
}
