import path from 'node:path'
import url from 'node:url'
import fse from 'fs-extra'
import compilerSfc from 'vue/compiler-sfc'
import compilerDom from '@vue/compiler-dom'

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
const { ast } = parseFile.descriptor.template
fse.writeFileSync(path.resolve(dirname, './ast.json'), JSON.stringify(parseFile.descriptor.template))
fse.writeFileSync(path.resolve(dirname, './dom.json'), JSON.stringify(compilerDom.compile(parseFile.descriptor.template.content)))
// console.log(parseFile.descriptor.template.ast)
