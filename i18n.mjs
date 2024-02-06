import fs from 'node:fs'
import path from 'node:path'
import { glob } from 'glob'
import Transformer from './src/vue/packages/transform.mjs'

const options = {
  pattern: 'src/**/*.vue',
  ignore: ['node_modules/**'],
  output: 'i18n/zh-CN.json'
}

const files = await glob(options.pattern, {
  ignore: options.ignore
})

files.forEach(filename => {
  // 暂只支持vue文件
  if (path.extname(filename) !== '.vue') {
    return
  }
  const filePath = path.resolve(process.cwd(), filename)
  const sourceCode = fs.readFileSync(filePath, 'utf8')

  const { generatedCode } = new Transformer({
    sourceCode,
    // locales,
    // useUniqKey: options.useUniqKey,
    // importPath: options.importPath,
    filePath,
    filename
  })

  // fs.writeFileSync(filePath, generatedCode, 'utf8')
})

