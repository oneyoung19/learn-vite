import * as compilerSfc from 'vue/compiler-sfc'
import babel from '@babel/core'

// template script styles
export function parseVue(code) {
  return compilerSfc.parse(code).descriptor
}

export function parseJS(code) {
  return babel.parseSync(code, {
    sourceType: 'module',
    configFile: false, // 不读取根目录下的babel配置
    babelrc: false
    // plugins: ['jsx'],
  })
}
