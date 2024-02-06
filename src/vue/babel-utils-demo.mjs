/*
@babel/core已包括以下四种库：

@babel/parser
@babel/types
@babel/traverse
@babel/generator
*/
import babel from '@babel/core'
import generator from '@babel/generator'
const babelGenerator = generator.default
// import babelParser from '@babel/parser'

const template = `<p>Hello World</p>` // html cant be parsed

const script = `console.log("Hello World")`

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
    exit () {
      console.log('Exit StringLiteral')
    }
  }
}

const newAst = babel.traverse(ast, visitor)
// console.log(babelGenerator)
// console.log(babelGenerator(ast, {
//   compact: false,
//   jsescOption: {
//     // not work
//     quotes: 'single'
//   }
// }))
console.log(babel.transformFromAst(ast).code)
