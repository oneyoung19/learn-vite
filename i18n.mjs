import fs from 'node:fs'
import { glob } from 'glob'
import Transformer from 'src/vue/packages/transform.mjs'

const options = {
  pattern: 'src/**/*.vue',
  ignore: ['node_modules/**'],
  output: 'i18n/zh-CN.json'
}

const files = await glob(options.pattern, {
  ignore: options.ignore
})

files.forEach(filename => {
  const filePath = path.resolve(process.cwd(), filename)
  const sourceCode = fs.readFileSync(filePath, 'utf8')

  const { result } = new Transformer({
    code: sourceCode,
    // locales,
    // useUniqKey: options.useUniqKey,
    // importPath: options.importPath,
    filename
  })

  fs.writeFileSync(filePath, result, 'utf8')
})

