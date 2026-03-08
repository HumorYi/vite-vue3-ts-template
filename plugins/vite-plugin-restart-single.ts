/**
 * 模拟 vite-plugin-restart
 *
 * 监听指定目录下的所有文件，只要更改就重启服务
 */

import type { ViteDevServer } from 'vite'
import { getFilePaths, type FileOption } from '../src/utils/file'

export default function vitePluginRestartSingle(option: FileOption) {
  const filePaths = getFilePaths(option)

  return {
    name: 'vite-plugin-restart-single',
    configureServer(server: ViteDevServer) {
      if (!filePaths.length) return

      filePaths.forEach(file => server.watcher.add(file))

      server.watcher.on('change', (path: string) => {
        if (filePaths.includes(path)) server.restart()
      })
    }
  }
}
