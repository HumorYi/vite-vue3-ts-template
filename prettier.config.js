export default {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  trailingComma: "none",
  bracketSpacing: true,
  arrowParens: "avoid",
  rangeStart: 0,
  rangeEnd: Infinity,
  requirePragma: false,
  insertPragma: false,
  proseWrap: "preserve",
  htmlWhitespaceSensitivity: "css",
  endOfLine: "lf",
  overrides: [
    { files: "*.css", options: { parser: "css" } },
    { files: "*.scss", options: { parser: "scss" } },
    { files: "*.less", options: { parser: "less" } }
  ]
}
