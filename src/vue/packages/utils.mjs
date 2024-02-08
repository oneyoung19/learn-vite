// 匹配中文字符
export function hasChineseChar(code) {
  return code && /[\u{4E00}-\u{9FA5}]/gmu.test(code)
}
