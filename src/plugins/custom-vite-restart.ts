import type { ViteDevServer } from 'vite'
import { getFilePaths, type FileOption } from '../utils/file'

export default function CustomViteRestart(option: FileOption) {
  const filePaths = getFilePaths(option)

  return {
    name: 'custom-vite-restart',
    configureServer(server: ViteDevServer) {
      if (!filePaths.length) return

      filePaths.forEach(file => server.watcher.add(file))

      server.watcher.on('change', (path: string) => {
        if (filePaths.includes(path)) server.restart()
      })
    }
  }
}
