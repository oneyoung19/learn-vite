import { plus } from './utils/utils.js'
// 在浏览器中利用原生ES导入 该语法会报错。因此vite需要预构建 Uncaught TypeError: Failed to resolve module specifier "lodash". Relative references must start with either "/", "./", or "../".
import { camelCase } from 'lodash'

console.log(plus(1, 2))
// console.log(camelCase('Hello World'))


/*
预构建的功能，体现在两方面：
1. 将CommonJS或者UMD转换为 ESM 规范，以便浏览器能够支持原生导入
2. 对第三方node_modules模块内的依赖作处理，转换模块路径，譬如：/node_modules/.vite/deps/lodash.js?v=d707e584
*/
