import './assets/styles/reset.less'
// 添加?inline参数，那么该css样式文件 将不会注入到页面中，而是返回模块默认值 供开发者使用
// import customLess from './assets/styles/custom.less?inline'
import './assets/styles/custom.less'
// 导入一个静态资源会返回解析后的URL 与添加?url参数表现一致
import usdImg from './assets/image/usd.png'
import enImg from './assets/image/cbibank-back-en.png'
// 导入JSON vite会将json文件转化为ESM规范文件
// import student, { name } from './data/student.json'
// console.log(student, name)
// 导入worker
import MyWorker from './worker.js?worker'
const worker = new MyWorker()
worker.postMessage('worker Message')
console.log(MyWorker)
import { plus } from './utils/utils.js'
import { testGlobImport } from './utils/index.js'
console.log('testGlobImport', testGlobImport)
// /src/assets/image/usd.png
console.log(usdImg)
// 在浏览器中利用原生ES导入 该语法会报错。因此vite需要预构建 Uncaught TypeError: Failed to resolve module specifier "lodash". Relative references must start with either "/", "./", or "../".
import { camelCase } from 'lodash'
import './commonjs'
import './async'

console.log(camelCase('Hello World'))

console.log(plus(1, 2))

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

/*
在ESM中，[import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta)属性包括两部分：
import.meta.url
import.meta.resolve()

vite在import.meta上拓展了import.meta.glob()方法，其功能类似于webpack中的require.context

[import.meta.glob](https://cn.vitejs.dev/guide/features#glob-import)

*/
