// 最多递归 5 层
// type DepthLimit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
type DepthLimit = 0 | 1 | 2 | 3 | 4 | 5

// prettier-ignore
// 辅助类型：减少深度值
type PrevDepth<D extends DepthLimit> =
  // D extends 10 ? 9 :
  // D extends 9 ? 8 :
  // D extends 8 ? 7 :
  // D extends 7 ? 6 :
  // D extends 6 ? 5 :
  D extends 5 ? 4 :
  D extends 4 ? 3 :
  D extends 3 ? 2 :
  D extends 2 ? 1 :
  D extends 1 ? 0 : 0;

// 基础 JSON 类型
export type JsonPrimitive = string | number | boolean | null

export type JsonValue<Depth extends DepthLimit = 5> =
  | JsonPrimitive
  | (Depth extends 0 ? never : { [key: string]: JsonValue<PrevDepth<Depth>> })
  | (Depth extends 0 ? never : JsonValue<PrevDepth<Depth>>[])

export interface JsonObject<Depth extends DepthLimit = 5> {
  [key: string]: JsonValue<Depth>
}
