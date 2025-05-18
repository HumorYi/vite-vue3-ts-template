import type { JsonObject } from './json'

export type loginRes = {
  token: string
}

export interface User extends JsonObject {
  id: number
  name: string
  role: string
}
