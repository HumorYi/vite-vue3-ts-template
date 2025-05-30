/**
 * import.meta.url 是一个 ESM 的原生功能，会暴露当前模块的 URL。
 * 将它与原生的 URL 构造器 组合使用，在一个 JavaScript 模块中，
 * 通过相对路径我们就能得到一个被完整解析的静态资源 URL
 * 这在现代浏览器中能够原生使用 - 实际上，Vite 并不需要在开发阶段处理这些代码！
 *
 * 在生产构建时，Vite 才会进行必要的转换保证 URL 在打包和资源哈希后仍指向正确的地址。
 * 然而，这个 URL 字符串必须是静态的，这样才好分析。
 * 否则代码将被原样保留、因而在 build.target 不支持 import.meta.url 时会导致运行时错误。
 */
export function getErrorPageImageUrl(url: string) {
  return new URL(`../assets/images/error-page/${url}.png`, import.meta.url).href
}
