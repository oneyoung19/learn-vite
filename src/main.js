import './assets/styles/reset.less'
// 添加?inline参数，那么该css样式文件 将不会注入到页面中，而是返回模块默认值 供开发者使用
import customLess from './assets/styles/custom.less?inline'
import { plus } from './utils/utils.js'
// 在浏览器中利用原生ES导入 该语法会报错。因此vite需要预构建 Uncaught TypeError: Failed to resolve module specifier "lodash". Relative references must start with either "/", "./", or "../".
import { camelCase } from 'lodash'

console.log(customLess)
console.log(plus(1, 2))
// console.log(camelCase('Hello World'))


/*
预构建的功能，体现在两方面：
1. 将CommonJS或者UMD转换为 ESM 规范，以便浏览器能够支持原生导入
2. 对第三方node_modules模块内的依赖作处理，转换模块路径，譬如：/node_modules/.vite/deps/lodash.js?v=d707e584

css处理，支持less sass stylus等等
需要安装对应的处理器，譬如 yarn add less -D

为什么webpack处理less时需要安装less以及less-loader 而vite只需要安装less呢？
其实处理less文件，需要的核心就是less库，它提供了API将less转化为css。在vite中内置了这些判断和转化。
而webpack属于模块打包器，没有内置less转换css的功能，所以需要less-loader中的代码执行less转换css的逻辑
*/
