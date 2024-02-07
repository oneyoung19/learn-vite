/*
@babel/core已包括以下四种库：

@babel/parser
@babel/types
@babel/traverse
@babel/generator
*/
import babel from '@babel/core'
import * as t from '@babel/types'
import generator from '@babel/generator'
const babelGenerator = generator.default
// import babelParser from '@babel/parser'

const template = `<p>Hello World</p>` // html cant be parsed

// const script = `console.log("Hello World")`
const script = '$t(\'标题2\')'

const ast = babel.parse(script)
// console.log(ast)
// console.log(babelParser.parseExpression(script))

const visitor = {
  CallExpression: {
    enter (path) {
      console.log('Enter CallExpression')
      // path.addComment('trailing', ';', true)
    },
    exit () {
      console.log('Exit CallExpression')
    }
  },
  StringLiteral: {
    enter (path) {
      console.log('Enter StringLiteral')
    },
    exit (nodePath) {
      // console.log('Exit StringLiteral', nodePath)
      const localeKey = nodePath.node.extra?.rawValue
      console.log('localeKey', localeKey)
      // nodePath.replaceWith(
      //   babel.types.callExpression(babel.types.identifier('$t'), [
      //     babel.types.stringLiteral(localeKey),
      //   ]),
      // )
      // if (localeKey) {
        console.log(t.callExpression(t.identifier('$t'), [
          t.stringLiteral(localeKey),
        ]))
        nodePath.replaceWith(
          t.callExpression(t.identifier('$t'), [
            t.stringLiteral(localeKey),
          ]),
        )
        nodePath.stop()
      // }
    }
  },
  TemplateLiteral: {
    enter (path) {
      console.log('Enter TemplateLiteral')
    },
    exit (nodePath) {
      console.log('Exit TemplateLiteral')
    }
  }
}

const newAst = babel.traverse(ast, visitor)
// console.log(babelGenerator)
console.log(babelGenerator(ast, {
  compact: false,
  jsescOption: {
    // not work
    // quotes: 'single'
    minimal: true
  }
}).code)
// console.log(JSON.stringify(ast))
// console.log(babel.transformFromAstSync(ast, {
//   jsescOption: {
//     minimal: true
//   }
// }).code)
