// 测试该导入是否包含index.js
// 测试结果是 默认不包含index.js
export const testGlobImport = import.meta.glob('../utils/*.js', {
  eager: true
})
