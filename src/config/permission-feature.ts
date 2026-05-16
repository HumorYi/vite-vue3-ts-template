import Role from './role'

type Feature = Record<string, {
  create?: string[]
  del?: string[]
  update?: string[]
  view?: string[]
}>

// 空数组表示都有权限
const feature: Feature = {
  product: {
    create: [Role.FINANCE, Role.ADMIN],
    del: [Role.FINANCE, Role.ADMIN],
    update: [Role.FINANCE, Role.ADMIN],
    view: [],
  },
}

export default feature
