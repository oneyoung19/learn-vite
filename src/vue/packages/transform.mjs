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

  i18nDirname = 'i18n'
  i18nCustomBlockType = 'i18n'

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

  getPathOfI18n (locale = '', { relative = false } = {}) {
    if (relative) {
      const i18nJsonRelativePath = `./${this.i18nDirname}/${locale}.json`
      return i18nJsonRelativePath
    }
    const dir = path.dirname(this.filePath)
    const i18nDir = `${dir}/${this.i18nDirname}`
    const i18nJson = `${i18nDir}/${locale}.json`
    return {
      i18nDir,
      i18nJson
    }
  }
  
  // Create i18n dir and create locale JSON files
  createI18nJSON () {
      const { i18nDir } = this.getPathOfI18n()
      fs.mkdir(i18nDir, { recursive: true }, (err) => {
        if (err) {
          console.error('Error creating directory:', err)
        } else {
          this.locales.forEach(locale => {
            const message = this.messages[locale]
            const { i18nJson } = this.getPathOfI18n(locale)
            if (fs.existsSync(i18nJson)) {
              const fileContent = fs.readFileSync(i18nJson, 'utf8')
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
            fs.writeFileSync(i18nJson, JSON.stringify({
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
      if ((customBlock.type === this.i18nCustomBlockType) && customBlock.attrs?.src && (
        this.locales.map(locale => this.getPathOfI18n(locale, { relative: true })).includes(customBlock.attrs.src)
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
        type: this.i18nCustomBlockType,
        content: '',
        attrs: {
          src: this.getPathOfI18n(locale, { relative: true })
        }
      })
    })
    return descriptor
  }
}
