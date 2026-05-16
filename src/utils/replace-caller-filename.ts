// plugins/vite-plugin-replace-caller-filename.ts 插件做了替换处理

const FILENAME_REGEX = /[^/]+\.(vue|[tj]sx?)/

// 目前仅支持 composable/useLang.ts 中的替换
export function getCallerFilename() {
  const stack = new Error('getCallerFileName').stack

  if (stack) {
    // 过滤栈中有效文件行
    const lines = stack.split('\n').filter(line => FILENAME_REGEX.test(line))

    // 取目标调用栈（规则同Node端）
    const targetLine = lines[2]

    if (targetLine) {
      const filename = targetLine.match(FILENAME_REGEX)?.[0]?.split('.')[0]

      if (filename) {
        return filename
      }
    }
  }

  return ''
}

// 目前仅支持 api/*.ts 中的替换
export function getPreUrl() {
  return `/${getCallerFilename()}`
}
