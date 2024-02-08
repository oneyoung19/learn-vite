import * as compilerSfc from 'vue/compiler-sfc'
import babel from '@babel/core'

export function parseSFC(code) {
  return compilerSfc.parse(code).descriptor
}

export function parseJS(code) {
  return babel.parseSync(code, {
    sourceType: 'module',
    configFile: false,
    babelrc: false
  })
}
