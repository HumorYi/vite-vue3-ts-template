import type { UserShortcuts } from 'unocss'
import { FileOptionType, getFilePaths } from '../../utils/file.ts'

// 因为 uno 是以插件方式注入到 vite 中，vite 中的 import.meta.glob 使用不了，所以只能用 Node 的方式来获取文件
const shortcuts: UserShortcuts = {}

getFilePaths({
  dir: __dirname,
  excludes: ['index.ts'],
  includeSuffixs: ['ts'],
  type: FileOptionType.FILE_KEY
}).forEach(file => Object.assign(shortcuts, file))

export default shortcuts
