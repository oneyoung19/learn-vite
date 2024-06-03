// module.exports = {
//   name: 'Andy'
// }
// 预构建 支持将第三方库的commonjs或者UMD规范 转化为ESModule
import jquery from 'jquery'

// 但项目里的源码写成UMD并不受支持 not work
// (function (global, factory){
//   if (typeof exports === 'object' && typeof module !== 'undefined') {
//     module.exports = factory()
//   } else if (typeof define === 'function' && define.amd) {
//     define(factory)
//   } else {
//     global = global || self
//     global.returnModule = factory()
//   }
// })(this, function () {
//   return {
//     // module
//     name: 'Andy'
//   }
// })
