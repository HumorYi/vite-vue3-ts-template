export interface LoginBody {
  username: string
  password: string
}

export interface LoginRes {
  accessToken: string
  refreshToken: string
}
