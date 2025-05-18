import { initDev } from './dev'
import { initProd } from './prod'

export function initEnvs() {
  if (import.meta.env.DEV) initDev()
  else if (import.meta.env.PROD) initProd()
}
