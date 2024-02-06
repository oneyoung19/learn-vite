import * as compilerSfc from 'vue/compiler-sfc'
import babel from '@babel/core'

// template script styles
export function parseVue(code) {
  return compilerSfc.parse(code).descriptor
}

export function parseJS(code) {
  return babel.parse(code, {
    sourceType: 'module',
    // plugins: ['jsx'],
  })
}
