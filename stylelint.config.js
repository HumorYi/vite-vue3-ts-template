// @see: https://stylelint.io

export default {
  plugins: ['stylelint-scss', 'stylelint-order'],
  /* 继承某些已有的规则 */
  extends: [
    'stylelint-config-standard', // 配置stylelint拓展插件
    'stylelint-config-html/vue', // 配置 vue 中 template 样式格式化
    'stylelint-config-standard-scss', // 配置stylelint scss插件
    'stylelint-config-recommended-vue/scss', // 配置 vue 中 scss 样式格式化
    'stylelint-config-recess-order' // 配置stylelint css属性书写顺序插件
  ],
  overrides: [
    {
      files: ['**/*.{vue,html}'],
      customSyntax: 'postcss-html'
    }
  ],
  /**
   * null  => 关闭该规则
   */
  rules: {
    'value-keyword-case': null, // 在 css 中使用 v-bind，不报错
    'no-descending-specificity': null, // 禁止在具有较高优先级的选择器后出现被其覆盖的较低优先级的选择器
    'function-url-quotes': 'always', // 要求或禁止 URL 的引号 "always(必须加上引号)"|"never(没有引号)"
    'rule-empty-line-before': null, // 要求或禁止在规则之前的空行 "always(规则之前必须始终有一个空行)"|"never(规则前绝不能有空行)"|"always-multi-line(多行规则之前必须始终有一个空行)"|"never-multi-line(多行规则之前绝不能有空行。)"
    'font-family-no-missing-generic-family-keyword': null, // 禁止在字体族名称列表中缺少通用字体族关键字
    'property-no-unknown': null, // 禁止未知的属性(true 为不允许)
    'no-empty-source': null, // 禁止空源码
    'selector-class-pattern': null, // 强制选择器类名的格式
    'scss/at-import-partial-extension': null, // 解决不能引入scss文件
    'value-no-vendor-prefix': null, // 关闭 vendor-prefix(为了解决多行省略 -webkit-box)
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'v-deep', 'deep']
      }
    ],
    'order/properties-order': [
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
      'display',
      'justify-content',
      'align-items',
      'float',
      'clear',
      'overflow',
      'overflow-x',
      'overflow-y',
      'margin',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'padding',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'width',
      'min-width',
      'max-width',
      'height',
      'min-height',
      'max-height',
      'font-size',
      'font-family',
      'font-weight',
      'border',
      'border-style',
      'border-width',
      'border-color',
      'border-top',
      'border-top-style',
      'border-top-width',
      'border-top-color',
      'border-right',
      'border-right-style',
      'border-right-width',
      'border-right-color',
      'border-bottom',
      'border-bottom-style',
      'border-bottom-width',
      'border-bottom-color',
      'border-left',
      'border-left-style',
      'border-left-width',
      'border-left-color',
      'border-radius',
      'text-align',
      'text-justify',
      'text-indent',
      'text-overflow',
      'text-decoration',
      'white-space',
      'color',
      'background',
      'background-position',
      'background-repeat',
      'background-size',
      'background-color',
      'background-clip',
      'opacity',
      'filter',
      'list-style',
      'outline',
      'visibility',
      'box-shadow',
      'text-shadow',
      'resize',
      'transition'
    ]
  },
  ignoreFiles: [
    'node_modules/**',
    'dist/**',
    'public/**',
    'src/**/*.ts',
    'src/**/*.js',
    'src/**/*.json'
  ]
}
