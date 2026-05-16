import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const rootDir = path.join(process.cwd(), 'src', 'i18n')
const localesDir = path.join(rootDir, 'locales')
const customDir = path.join(rootDir, 'custom')
const translateDir = path.join(customDir, 'translated')
const waitTranslateDir = path.join(customDir, 'wait-translate')

const sourceFileName = 'zh.js'
const sourceFile = path.join(localesDir, sourceFileName)

// 读取 locales 目录下的所有 .js 文件，过滤掉 sourceFile 对应的文件
const targetFiles = fs.readdirSync(localesDir, { withFileTypes: true })
  .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js') && dirent.name !== sourceFileName)
  .map(dirent => ({
    originFile: path.join(localesDir, dirent.name),
    translatedFile: path.join(translateDir, dirent.name),
    waitTranslateFile: path.join(waitTranslateDir, dirent.name),
  }))

const regExportDefault = /export default\s+(.*)/s
const regSemicolonEnd = /;\s*$/

function log(text) {
  console.log(`sync-locales.js: ${text}`)
}

// 读取文件内容并解析为对象
function readFileContent(filePath) {
  try {
    const isExists = fs.existsSync(filePath)

    if (!isExists) {
      writeFileContent(filePath)
    }

    const fileContent = fs.readFileSync(filePath, 'utf8')
    const match = fileContent.match(regExportDefault)
    if (match && match[1]) {
      const contentStr = match[1].replace(regSemicolonEnd, '')
      // eslint-disable-next-line no-new-func
      return new Function(`return ${contentStr}`)()
    }
    return {}
  }
  catch (error) {
    log(`Error reading file ${filePath}: ${error.message}`)
    return {}
  }
}

// 写入对象到文件
function writeFileContent(filePath, content = {}) {
  try {
    const fileContent = `export default ${JSON.stringify(content, null, 2)};`

    fs.writeFileSync(filePath, fileContent)
    log(`Updated file: ${filePath}`)
  }
  catch (error) {
    log(`Error writing file ${filePath}: ${error.message}`)
  }
}

function syncObject(sourceData, translatedData, waitTranslateData) {
  for (const [k, v] of Object.entries(sourceData)) {
    if (typeof v === 'string') {
      if (translatedData[v]) {
        sourceData[k] = translatedData[v]
      }
      else {
        waitTranslateData[v] = v
      }

      continue
    }

    if (typeof v === 'object') {
      syncObject(v, translatedData, waitTranslateData)
    }
  }
}

// 同步单个目标文件
function syncTargetFile(sourceData, targetFile) {
  const { originFile, translatedFile, waitTranslateFile } = targetFile
  const targetName = path.basename(originFile)

  log(`Syncing to ${targetName}...`)

  const cloneSourceData = JSON.parse(JSON.stringify(sourceData))
  const translatedData = readFileContent(translatedFile)
  const waitTranslateData = readFileContent(waitTranslateFile)

  syncObject(cloneSourceData, translatedData, waitTranslateData)

  // 写入同步后的内容
  writeFileContent(originFile, cloneSourceData)

  // 过滤出未翻译的键值对
  const newWaitTranslateData = {}

  Object.entries(waitTranslateData).forEach(([k, v]) => {
    if (!translatedData[k]) {
      newWaitTranslateData[k] = v
    }
  })

  writeFileContent(waitTranslateFile, newWaitTranslateData)
}

// 开始同步
function startSync() {
  log('Starting to sync locales...')

  // 检查源目录是否存在
  if (!fs.existsSync(sourceFile)) {
    log(`Source directory ${sourceFile} does not exist!`)
    return
  }

  const sourceData = readFileContent(sourceFile)

  // 同步到每个目标文件
  targetFiles.forEach((targetFile) => {
    syncTargetFile(sourceData, targetFile)
  })

  log('Sync completed!')
}

// 运行同步
startSync()
