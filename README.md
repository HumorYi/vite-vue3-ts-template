# Vue3 + TS + Vite 项目模板

## 处理事项

- 项目规范
  - stylelint（样式规范）若使用 VsCode，需安装 Stylelint 插件
  - eslint（脚本规范）若使用 VsCode，需安装 ESLint 插件
  - prettier（格式化规范）若使用 VsCode，需安装 Prettier - Code formatter 插件
  - commitlint（git 提交规范）

- Vite
  - 基础配置：路径映射、请求代理、注入样式全局变量等
  - [UnoCss](https://unocss.dev/guide/) ，可直接使用内部基础样式，亦可依据项目需求组装等
  - API 自动按需导入，不用再频繁导入依赖包 API，提升开发效率
  - 组件 自动按需导入，不用再频繁导入依赖包 组件，提升开发效率
  - 开发环境优化：Vite 服务重启，引入相关配置文件，更改时自动重启，不用断开服务再手动重启，提升开发效率
  - 生产环境优化：压缩文件、压缩图片
  - 打包分析：查看打包后资源包是否打包、文件大小、文件拆分等

- http 请求，使用 axios

  - 封装请求工厂函数，适配访问多方 API，提供了通用配置 及 API 单独配置优先
  - 请求拦截器
    - 提供请求数据处理函数，可按需引入 或 自定义
    - 中断重复请求，依据请求 method、url、params、data 来判断
  - 响应拦截器
    - 响应超时重试，可设置重试次数、超时时间
    - 关闭 loading
  - 请求扩展，将请求方法包装一层，接收自定义请求选项
    - 是否 携带 token
    - 开启 loading
      - 通过定时器来设置 loading 延迟时间，避免用户一点击就弹出吓一跳，提升用户体验
      - 通过计数器控制多个请求只开启一个 loading，避免重复开启，导致闪烁
      - 内部提供了几种 loading 类型，如：带蒙板的、不带蒙板的、gif 图 等
      - 可根据选项传递对应配置，例如：使用不同类型 loading、是否开启 loading
    - 文件下载
    - 响应状态码处理，200 返回，401 跳登录，其它错误码跳对应页面，可根据需要调整
    - 先进先出，适用于一些任务类场景（批量请求按顺序返回）
      - 先访问的请求先返回响应处理，就算后请求先返回响应处理，也要等前面请求响应才返回
      - 实现原理，使用 Promise 截住请求、计数器 控制顺序、定时器 轮询检测

- 路由处理

  - 路由表分为 基础表、权限表、错误表
  - 路由基础表，通过配置元数据 meta { auth: Boolean } 来要求当前路由是否需要用户认证
  - 路由权限表，通过配置元数据 meta { permission: Boolean } 来要求当前路由是否需要权限
    - 使用静态路由方式，直接注入到路由表中
    - 默认权限表在未获取用户数据前无权限，即 元数据 meta { permission: false }
  - 路由错误表 处理错误页，例如：404、403、500 等
  - 注册路由表前，会检测路由表中是否有重名/重地址，避免冲突
  - 全局前置守卫
    - 若需要认证用户 或 访问的是权限表，获取用户信息，设置权限表中 用户可访问路由权限，未登录跳登录页
    - 若无权限，调回首页（可自行更改）
    - 若有权限，直接访问
  - 目前提供三种权限处理方案，可通过 src/config/router.ts 设置，若不满足，可自定义
    - dynamic（动态路由 / 动态角色）
      - 获取用户信息后会为权限路由中与用户路由匹配的路由开启权限
    - role（固定路由，多个角色）
      - 通过元数据设置角色：meta { roles: [ 'admin', 'user' ] }
      - 默认上层路由配置了角色，下层均同角色，如某个路由角色不一，需为该路由单独设置角色
      - 获取用户信息后会为权限路由中与用户角色匹配的路由开启权限
    - auth（固定路由，单个角色，只需登录）
      - 获取用户信息后会为权限路由开启所有权限，无需设置
  - 路由表名称处理，在 src/config/router.ts 中进行配置，路由表中引用，便于维护和避免出错

    ```js
      // 路由名称配置
      export const RouteName = {
        // 单个路由
        home: '', // Home
        login: '',
        // 嵌套路由
        settings: {
          root: '', // 根路由，名称为 父路由名 Settings
          base: '', // 子路由，名称为 父路由名 + 子路由名，SettingsBase
          advance: { // 嵌套子路由
            root: '', // 根路由，名称为 父路由名 SettingsAdvance
            base: '', // 子路由，名称为 父路由名 + 子路由名，SettingsAdvanceBase
            other: ''
          }
        },
        user: {
          root: '',
          base: '',
          advance: ''
        },
        // error 错误页不做处理
        error: {
          403: '',
          404: '',
          405: ''
        }
      }

      // 大驼峰命名，按路由表嵌套关系一路追加上层路由名，错误页路由不做处理，有些可能直接以状态码为名
      function initRouteName(obj: JsonObject, parentKey?: string) {
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            if (parentKey) {
              obj[key] =
                capitalize(parentKey) + (key === 'root' ? '' : capitalize(key))
            } else {
              obj[key] = capitalize(key)
            }

            continue
          }

          if (key !== 'error') initRouteName(obj[key] as JsonObject, key)
        }
      }

      initRouteName(RouteName)
    ```

- 批量处理
  - src/components 自动注册全局组件
  - src/directives 自动注册全局指令
  - src/uno
    - /presets 自动注入到 uno.config.ts 里面的 presets
    - /shortcuts 自动注入到 uno.config.ts 里面的 shortcuts

## 目录结构

├── .env // 公共环境变量
├── .env.development // 开发环境变量
├── .env.production // 生产环境变量
├── .gitignore // git 提交忽略文件
├── .husky  // git hook钩子
├── .prettierignore // prettier 忽略文件
├── commitlint.config.js // commitlint 配置
├── eslint.config.js // eslint 配置
├── index.html // 入口 html
├── package-lock.json // 包配置，锁定依赖版本
├── package.json // 包配置
├── prettier.config.js // prettier 配置
├── public // 静态资源
├── README.md // 先看此文件，便于了解项目设计思路
├── src // 源码
│   ├── api // api 请求
│   │   ├── common.ts
│   │   └── user.ts
│   ├── App.vue // 入口组件
│   ├── assets // 资源
│   │   └── images
│   │       ├── error-page
│   │       │   ├── 403.png
│   │       │   ├── 404.png
│   │       │   └── 500.png
│   │       └── loading
│   │           └── loading.gif
│   ├── components // 全局组件
│   │   ├── common // 公共组件
│   │   │   └── RouterLinkPermission.vue // 权限 router-link，有权限则显示
│   │   ├── layouts // 布局组件
│   │   └── modules // 业务组件
│   ├── composables // composition 函数
│   │   └── useAuth.ts
│   ├── config // 自定义配置
│   │   ├── router.ts
│   │   └── user.ts
│   ├── directives // 全局指令
│   │   ├── index.ts
│   │   └── modules
│   │       ├── copy.ts
│   │       ├── debounce.ts
│   │       ├── draggable.ts
│   │       ├── longPress.ts
│   │       ├── throttle.ts
│   │       ├── typewriter.ts
│   │       ├── validate.ts
│   │       └── waterMarker.ts
│   ├── dts // ts 声明文件
│   │   ├── auto-imports.d.ts
│   │   ├── components.d.ts
│   │   ├── pinia-plugin-persist.d.ts
│   │   └── vite-env.d.ts
│   ├── http // http 请求，使用 axios
│   │   ├── factory // 工厂函数
│   │   │   ├── download.ts // 文件下载
│   │   │   ├── index.ts // 入口文件
│   │   │   ├── loading // loading 目录
│   │   │   │   ├── counter.ts // 计数器
│   │   │   │   ├── loading.ts // loading 处理
│   │   │   │   └── timer.ts // 定时器
│   │   │   ├── req-config.ts // 请求配置，请求前处理配置，例如：根据不同请求方法转换参数
│   │   │   ├── req-repeat.ts // 请求重复
│   │   │   ├── res-code.ts // 响应状态码处理
│   │   │   └── res-timeout.ts // 响应超时
│   │   └── index.ts
│   ├── main.ts // 入口文件
│   ├── plugins // 插件
│   │   └── custom-vite-restart.ts
│   ├── router // 路由器
│   │   ├── index.ts // 路由器入口
│   │   └── routes // 路由表
│   │       ├── base.ts // 基础路由，不需要权限
│   │       ├── error.ts // 错误路由
│   │       ├── index.ts // 路由表入口
│   │       └── permission.ts // 权限路由，需要权限
│   ├── store // pinia store
│   │   └── useUserStore.ts // 用户 store
│   ├── styles // 样式表
│   │   ├── base.scss
│   │   ├── index.scss
│   │   ├── loading.scss
│   │   └── variables.scss
│   ├── types // 类型定义
│   │   ├── api.ts
│   │   ├── http.ts
│   │   └── json.ts
│   ├── uno // 自定义 uno 配置
│   │   ├── presets // 自定义 预设
│   │   │   ├── bg.ts
│   │   │   ├── color.ts
│   │   │   └── index.ts
│   │   └── shortcuts // 自定义 快捷类
│   │       ├── box.ts
│   │       ├── flex.ts
│   │       ├── index.ts
│   │       └── position.ts
│   ├── utils // 工具库
│   │   ├── base.ts
│   │   ├── dom.ts
│   │   ├── file.ts
│   │   ├── resource.ts
│   │   └── route.ts
│   └── views // 页面目录
│       ├── error // 错误页（测试）
│       │   ├── 403.vue
│       │   ├── 404.vue
│       │   ├── 500.vue
│       │   └── Index.vue
│       ├── home // 首页（测试：权限路由）
│       │   └── Index.vue
│       ├── login // 登录页（测试）
│       │   └── Index.vue
│       ├── settings // 设置页（测试：权限路由）
│       │   ├── Advance // 嵌套页（测试：嵌套路由）
│       │   │   ├── Base.vue
│       │   │   ├── Home.vue
│       │   │   ├── Index.vue
│       │   │   └── Other.vue
│       │   ├── Base.vue
│       │   ├── Home.vue
│       │   └── Index.vue
│       └── user // 设置页（测试：权限路由）
│           ├── Advance.vue
│           ├── Base.vue
│           ├── Home.vue
│           └── Index.vue
├── stylelint.config.js // stylelint 配置
├── tsconfig.app.json  // vite 在 app 环境中的 ts 规则
├── tsconfig.json      // ts 配置
├── tsconfig.node.json // vite 在 node 环境中的 ts 规则
├── uno.config.ts      // uno 配置
└── vite.config.ts     // vite 配置
