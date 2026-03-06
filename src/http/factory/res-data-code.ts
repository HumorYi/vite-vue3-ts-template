export enum ResDataCode {
  // 提示信息
  Tip = 1
}

export function handleResDataCode(data: Record<string, any>) {
  const { code, message } = data

  if (code === ResDataCode.Tip) {
    if (message) alert(message)

    return
  }

  console.error('未知响应状态码:', code)
}
