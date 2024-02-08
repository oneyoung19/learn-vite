import fs from 'node:fs'
import path from 'node:path'
import { parseSFC } from './parse.mjs'
import { transformTemplateAst, transformJsAst } from './transformAst.mjs'
import { hasChineseChar } from './utils.mjs'
import {
  generateTemplate,
  generateSFC,
} from './generator.mjs'

export default class {
  generatedCode = ''

  locales = ['zh-cn', 'zh-hant', 'en']
  defaultLocale = 'zh-cn'

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
    const descriptor = parseSFC(this.sourceCode)
    // 转译template
    if (hasChineseChar(descriptor.template.content)) {
      fs.writeFileSync(path.resolve(process.cwd(), './data/ast.json'), JSON.stringify(descriptor?.template?.ast))
      // fs.writeFileSync(path.resolve(process.cwd(), './data/ast2.json'), JSON.stringify(transformTemplateAst.call(this, descriptor?.template?.ast)))
      descriptor.template.content = generateTemplate({
        ...transformTemplateAst.call(this, descriptor?.template?.ast),
        // ...descriptor?.template?.ast,
        tag: '',
      })
      const writedCustomBlockDescriptor = this.writeCustomBlocksToSFC(descriptor)
      this.generatedCode = generateSFC(writedCustomBlockDescriptor)
      console.log(this.generatedCode)
    }
  }
  
  // Create i18n dir and create locale JSON files
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

  // Write i18n custom blocks to SFC
  writeCustomBlocksToSFC (descriptor) {
    descriptor.customBlocks = Array.isArray(descriptor.customBlocks) ? descriptor.customBlocks : []
    const i18nCustomBlockIndexs = []
    descriptor.customBlocks.forEach((customBlock, blockIndex) => {
      if (customBlock.type === 'i18n' && customBlock.attrs?.src && (
        this.locales.map(locale => `./i18n/${locale}.json`).includes(customBlock.attrs.src)
      )) {
        i18nCustomBlockIndexs.push(blockIndex)
      }
    })
    // If i18n custom blocks exists
    if (i18nCustomBlockIndexs.length > 0) {
      for (let i = i18nCustomBlockIndexs.length - 1; i >= 0; i--) {
        descriptor.customBlocks.splice(i, 1)
      }
    }
    // Add custom blocks
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
