// 分页参数（通用）
export type PageParams = {
  pageNum: number
  pageSize: number
}

// 分页返回结果（通用）
export type PageResult<T> = PageParams & {
  list: T[]
  total: number
}