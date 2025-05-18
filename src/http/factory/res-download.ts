import type { AxiosResponse } from 'axios'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function resDownload(res: AxiosResponse<BlobPart, any>) {
  const { headers, data } = res
  const blob = new Blob([data], { type: headers['content-type'] })
  const matches = headers['content-disposition'].match(/filename=(.*)/)
  const filename = matches ? decodeURIComponent(matches[1]) : ''
  const URL = window.URL || window.webkitURL
  const objectUrl = URL.createObjectURL(blob)

  const a = document.createElement('a')

  a.style.display = 'none'
  a.href = objectUrl
  a.download = filename

  document.body.appendChild(a)

  a.click()

  document.body.removeChild(a)

  URL.revokeObjectURL(objectUrl)
}
