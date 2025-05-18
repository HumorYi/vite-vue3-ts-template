import { readdirSync } from 'fs'
import { join } from 'path'

export enum FileOptionType {
  FILEPATH = 'filepath',
  FILE = 'file',
  FILE_KEY = 'default'
}

export type FileOption = {
  dir: string
  excludes?: string[]
  excludeSuffixs?: string[]
  includes?: string[]
  includeSuffixs?: string[]
  type?: FileOptionType
}

export function getFileExt(path: string) {
  return (
    decodeURIComponent(path)
      .match(/\.([^./\\?#]*)(?=[?#]|$)/)?.[1]
      ?.toLowerCase() || ''
  )
}

export function getFileName(path: string) {
  return decodeURIComponent(path).match(/[^/\\?#]*(?=[?#]|$)/)?.[0] || ''
}

export function getFileNameWithoutExt(path: string) {
  return getFileName(path).replace(/(?!^\.)\.\w*$/, '')
}

export function getFilePaths({
  dir,
  excludes,
  excludeSuffixs,
  includes,
  includeSuffixs,
  type = FileOptionType.FILEPATH
}: FileOption) {
  return readdirRecursive(dir)
    .filter(
      filePath =>
        !excludes?.includes(filePath) ||
        !excludeSuffixs?.some(suffix => getFileExt(filePath) === suffix) ||
        includes?.includes(filePath) ||
        includeSuffixs?.some(suffix => getFileExt(filePath) === suffix)
    )
    .map(filePath => {
      switch (type) {
        case FileOptionType.FILE:
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require(filePath)
        case FileOptionType.FILE_KEY:
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require(filePath)[FileOptionType.FILE_KEY]

        default:
          return filePath
      }
    })
}

export function readdirRecursive(dir: string) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const result: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) result.push(...readdirRecursive(fullPath))
    else result.push(fullPath)
  }

  return result
}
