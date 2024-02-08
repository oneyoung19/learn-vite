import path from 'node:path'
import url from 'node:url'
import fse from 'fs-extra'
import * as compilerSfc from 'vue/compiler-sfc'
import compilerDom from '@vue/compiler-dom'
import babel from '@babel/core'

// __dirname is not defined in ES module scope
const fileUrl = import.meta.url // file:///Users/yangxiaoping/Desktop/learn-vite/src/vue/compiler.mjs
const filePath = url.fileURLToPath(fileUrl) // /Users/yangxiaoping/Desktop/learn-vite/src/vue/compiler.mjs
const dirname = path.dirname(filePath)

console.log(path.resolve()) // it is cwd, not __dirname

const file = fse.readFileSync(path.resolve(dirname, './HelloWorld.vue'), 'utf8')

const parseFile = compilerSfc.parse(file)

// console.log(parseFile)

const templateContent = parseFile.descriptor.template?.content

const scriptContent = parseFile.descriptor.script?.content
// 处理template
// const { ast } = parseFile.descriptor.template
// fse.mkdirSync(path.resolve(dirname, '../../data'))
fse.writeFileSync(path.resolve(dirname, '../../data/descriptor.json'), JSON.stringify(parseFile.descriptor))
fse.writeFileSync(path.resolve(dirname, '../../data/template.json'), JSON.stringify(parseFile.descriptor.template))
fse.writeFileSync(path.resolve(dirname, '../../data/script.json'), JSON.stringify(parseFile.descriptor.script))
fse.writeFileSync(path.resolve(dirname, '../../data/styles.json'), JSON.stringify(parseFile.descriptor.styles))

const templateAst = compilerDom.compile(templateContent, { mode: 'module' })
// fse.writeFileSync(path.resolve(dirname, '../../data/dom.json'), JSON.stringify(templateAst))
// const parseTarget = templateAst.code
const parseTarget = "'你好吗'"
// const parseTarget = "$t('你好吗')"
const babelAst = babel.parseSync(parseTarget, {
  sourceType: "module",
  configFile: false, // 不读取根目录下的babel配置
  babelrc: false
})
fse.writeFileSync(path.resolve(dirname, '../../data/babelAst.json'), JSON.stringify(babelAst))
// console.log(parseFile.descriptor.template.ast)
