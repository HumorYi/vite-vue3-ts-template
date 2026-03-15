// 前后端约定数据状态码，前端做出对应处理，例如：提示信息、再次确认
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

  return data
}
