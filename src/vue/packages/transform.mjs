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

  constructor ({ sourceCode = '', filePath }) {
    this.sourceCode = sourceCode
    this.filePath = filePath
    this.startTransform()
    this.createI18nJSON()
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
      const writedCustomBlockDescriptor = this.writeCustomBlockToVue(descriptor)
      this.generatedCode = generateSfc(writedCustomBlockDescriptor)
      console.log(this.generatedCode)
    }
  }
  
  // 创建i18n目录并写入相关JSON
  createI18nJSON () {
    const dir = path.dirname(this.filePath)
    const i18nDir = `${dir}/i18n`
      fs.mkdir(i18nDir, { recursive: true }, (err) => {
        if (err) {
          console.error('Error creating directory:', err)
        } else {
          this.locales.forEach(locale => {
            const message = this.messages[locale]
            const localeFile = `${i18nDir}/${locale}.json`
            if (fs.existsSync(localeFile)) {
              const fileContent = fs.readFileSync(localeFile, 'utf8')
              if (fileContent) {
                const fileData = JSON.parse(fileContent)
                handle(fileData)
                function handle (data) {
                  if (data) {
                    const keys = Object.keys(data)
                    keys.forEach(key => {
                      if (typeof data[key] === 'string' || typeof data[key] === 'number') {
                        message[key] = data[key]
                      } else {
                        handle(data[key])
                      }
                    })
                  }
                }
              }
            }
            fs.writeFileSync(localeFile, JSON.stringify({
              [locale]: message
            }))
          })
        }
    })
  }

  // 在vue文件中写入<i18n> custom block
  writeCustomBlockToVue (descriptor) {
    descriptor.customBlocks = Array.isArray(descriptor.customBlocks) ? descriptor.customBlocks : []
    this.locales.forEach(locale => {
      descriptor.customBlocks.push({
        type: 'i18n',
        content: '',
        attrs: {
          src: `./i18n/${locale}.json`
        }
      })
    })
    return descriptor
  }
}
