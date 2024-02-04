import path from 'node:path'
import url from 'node:url'
import fse from 'fs-extra'
import { parse } from 'vue/compiler-sfc'

// __dirname is not defined in ES module scope
const fileUrl = import.meta.url // file:///Users/yangxiaoping/Desktop/learn-vite/src/vue/compiler.mjs
const filePath = url.fileURLToPath(fileUrl) // /Users/yangxiaoping/Desktop/learn-vite/src/vue/compiler.mjs
const dirname = path.dirname(filePath)

console.log(path.resolve()) // it is cwd, not __dirname

const file = fse.readFileSync(path.resolve(dirname, './HelloWorld.vue'), 'utf8')

const parseFile = parse(file)

// console.log(parseFile)

const templateContent = parseFile.descriptor.template?.content

console.log(templateContent)
