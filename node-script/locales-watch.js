import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const rootDir = path.join(process.cwd(), 'src', 'i18n')
const localesDir = path.join(rootDir, 'locales')
const customDir = path.join(rootDir, 'custom')

// 监听目录及生成目标文件
const configs = [
  {
    watchDir: path.join(customDir, 'zh'),
    targetFile: path.join(localesDir, 'zh.js'),
  },
]

// 正则表达式匹配实际的 export default 语句（不在注释中）
const regExportDefault = /^\s*export\s+default\s+(.*)/ms
const regSemicolonEnd = /;\s*$/

function log(text) {
  console.log(`node files-watch.js : ${text}`)
}

// 读取监听目录下的所有文件并生成目标文件
function updateTargetFile(watchDir, targetFile) {
  const targetName = path.basename(targetFile)
  log(`Updating ${targetName}...`)

  try {
    const result = {}

    // 递归读取目录
    function readDir(dir, prefix = []) {
      const files = fs.readdirSync(dir)

      files.forEach((file) => {
        const fullPath = path.join(dir, file)
        const stats = fs.statSync(fullPath)

        if (stats.isDirectory()) {
          readDir(fullPath, [...prefix, file])
        }
        else if (stats.isFile() && path.extname(file) === '.js') {
          const keys = [...prefix, path.basename(file, '.js')]

          // 读取文件内容
          const fileContent = fs.readFileSync(fullPath, 'utf8')
          // 提取 export default 后的内容
          const match = fileContent.match(regExportDefault)
          let content = {}

          // 只有当找到 export default 时才尝试解析内容
          if (match && match[1]) {
            try {
              // 移除末尾的分号
              const contentStr = match[1].replace(regSemicolonEnd, '')
              // 使用 Function 构造函数代替 eval，更安全
              // eslint-disable-next-line no-new-func
              content = new Function(`return ${contentStr}`)()
            }
            catch (error) {
              console.error(`Error parsing file ${fullPath}:`, error)
            }
          }

          // 按路径设置嵌套对象 - 即使没有 export default 也创建目录结构
          let current = result

          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {}
            }

            current = current[keys[i]]
          }

          // 只有当文件有内容时才添加到结果中
          current[keys.at(-1)] = content
        }
      })
    }

    readDir(watchDir)

    // 生成目标文件内容
    const fileContent = `export default ${JSON.stringify(result, null, 2)};`
    fs.writeFileSync(targetFile, fileContent)
    log(`${targetName} updated successfully!`)
  }
  catch (error) {
    log(`Error updating ${path.basename(targetFile)}: ${error.message}`)
  }
}

// 开始监听所有目录的变化
configs.forEach((config) => {
  const watchDirName = path.basename(config.watchDir)
  log(`Starting to watch ${watchDirName} directory for changes...`)

  // 监听目录的变化
  fs.watch(config.watchDir, { recursive: true }, (eventType, filename) => {
    if (['change', 'rename'].includes(eventType) && filename) {
      log(`File ${filename} changed, updating ${path.basename(config.targetFile)}...`)
      updateTargetFile(config.watchDir, config.targetFile)
    }
  })
})
