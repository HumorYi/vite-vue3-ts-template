// eslint.config.js
import typescriptESLint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import eslintPluginVue from "eslint-plugin-vue"
import vue3Essential from "eslint-plugin-vue/lib/configs/vue3-essential.js"
import vueParser from "vue-eslint-parser"

export default [
  {
    files: ["**/*.js", "**/*.ts", "**/*.vue"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    }
  },
  {
    files: ["**/*.vue"],
    plugins: { vue: eslintPluginVue },
    rules: {
      ...vue3Essential.rules
    }
  },
  {
    files: ["**/*.ts", "**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser
      }
    },
    plugins: { "@typescript-eslint": typescriptESLint },
    rules: {
      ...typescriptESLint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all", // 检查所有变量
          args: "after-used", // 只检查最后一个未使用的参数
          ignoreRestSiblings: true, // 忽略剩余变量
          argsIgnorePattern: "^_", // 忽略以下划线开头的函数参数
          varsIgnorePattern: "^_" // 忽略以下划线开头的变量
        }
      ],
      "@typescript-eslint/no-explicit-any": "error", // 确保规则已启用
      // 单字组件名
      "vue/multi-word-component-names": "off"
    }
  }
]
