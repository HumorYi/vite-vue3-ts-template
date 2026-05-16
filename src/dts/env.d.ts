/// <reference types="vite/client" />
/// <reference types="vue-router/auto" />

declare module '*.vue' {}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_API_BASE: string
  readonly VITE_APP_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
