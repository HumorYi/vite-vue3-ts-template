import DOMPurify from 'dompurify'

// 通用 XSS 过滤函数
export const filterXSS = (html: string, options = {}) => {
  const defaultOptions = {
    ALLOWED_TAGS: ['p', 'br', 'em', 'strong', 'img', 'div', 'span'],
    ALLOWED_ATTR: ['src', 'alt', 'class', 'style', 'width', 'height']
  }

  return DOMPurify.sanitize(html, { ...defaultOptions, ...options })
}

// 纯文本转义函数
export const escapeHtml = (str: string) => {
  if (!str) return ''

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
