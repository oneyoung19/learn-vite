import fs from 'node:fs'
import path from 'node:path'
import { parseVue } from './parse.mjs'
import { transformTemplateAst, transformJsAst } from './transformAst.mjs'
import { hasChineseChar } from './utils.mjs'
import {
  generateTemplate,
  generateSfc,
} from './generator.mjs'

export default class {
  generatedCode = ''
  
  locales = ['zh-cn', 'zh-hant', 'en']
  defaultLocale = 'zh-cn'

  // 提取的中文键值对
  messages = {}

  importVar = 'I18N'

  importPath = ''

  constructor ({ sourceCode = '', filePath, filename }) {
    this.sourceCode = sourceCode
    this.filePath = filePath
    this.startTransform()
    console.log('messages', this.messages)
  }
  startTransform () {
    const descriptor = parseVue(this.sourceCode)
    // 转译template
    if (hasChineseChar(descriptor.template.content)) {
      fs.writeFileSync(path.resolve(process.cwd(), './data/ast.json'), JSON.stringify(descriptor?.template?.ast))
      // fs.writeFileSync(path.resolve(process.cwd(), './data/ast2.json'), JSON.stringify(transformTemplateAst.call(this, descriptor?.template?.ast)))
      descriptor.template.content = generateTemplate({
        ...transformTemplateAst.call(this, descriptor?.template?.ast),
        // ...descriptor?.template?.ast,
        tag: '',
      })
      this.generatedCode = generateSfc(descriptor)
      console.log(this.generatedCode)
    }
  }
  
  // 创建i18n目录并写入相关JSON
  createI18nJSON () {}
  // 在vue文件中写入<i18n> custom block
  writeCustomBlockToVue () {}
}
