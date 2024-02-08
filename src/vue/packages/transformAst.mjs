import { parseJS } from './parse.mjs'
import { hasChineseChar } from './utils.mjs'
import { FileType, NodeTypes } from './types.mjs'
import {
  generateJS,
  generateInterpolation,
} from './generator.mjs'
import babel from '@babel/core'
import * as t from '@babel/types'

function extractChar (char) {
  char = char.trim()
  this.locales.forEach(locale => {
    this.messages[locale] = this.messages[locale] || {}
    if (locale === this.defaultLocale) {
      this.messages[locale][char] = char
    } else {
      this.messages[locale][char] = ''
    }
  })
  return char
}

function createDirectiveAttr(type, name, value) {
  // 处理特殊的事件属性
  if (type === 'on') {
    return {
      name: 'on',
      type: NodeTypes.DIRECTIVE,
      loc: {
        source: `@${name}="${value}"`,
      },
    };
  }

  return {
    name: 'bind',
    type: NodeTypes.DIRECTIVE,
    loc: {
      source: `:${name}="${value}"`,
    },
  };
}

function createInterpolationNode(content) {
  return {
    type: NodeTypes.INTERPOLATION,
    loc: {
      source: `{{ ${content} }}`,
    },
  };
}

export function transformTemplateAst (ast) {
  // console.log(ast)
  /**
   * this is a hack
   * FIXME:指定 v-pre 的元素的属性及其子元素的属性和插值语法都不需要解析，
   * 但是 @vue/compiler-sfc 解析后的props中不会包含 v-pre 的属性名，所以这里暂时使用正则表达式匹配v-pre，并生动注入 v-pre 到 props 中
   * https://github.com/vuejs/vue-next/issues/4975
   */
  if (
    ast.type === 1
    && /^<+?[^>]+\s+(v-pre)[^>]*>+?[\s\S]*<+?\/[\s\S]*>+?$/gm.test(
      ast.loc.source,
    )
  ) {
    ast.props = [
      {
        type: 7,
        name: 'pre',
        // @ts-expect-error 类型“{ source: string; }”缺少类型“SourceLocation”中的以下属性: start, endts(2739)
        loc: {
          source: 'v-pre',
        },
      },
    ];
    return ast;
  }

  if (ast.props?.length) {
    console.log('ast.props', JSON.stringify(ast.props))
    ast.props = ast.props.map((prop) => {
      // vue指令
      if (
        prop.type === 7
        && hasChineseChar(prop.exp?.content)
      ) {
        console.log('prop', prop)
        const jsCode = generateInterpolation(
          transformJsAst.call(this, parseJS(prop.exp?.content), { isInTemplate: true }),
        );
        console.log('jsCode', jsCode)
        return createDirectiveAttr(
          prop.name,
          prop.arg?.content,
          jsCode,
        )
      }

      // 普通属性
      if (prop.type === 6 && hasChineseChar(prop.value?.content)) {
        const localeKey = extractChar.call(this, prop.value?.content);
        console.log('localeKey', localeKey)
        return createDirectiveAttr('bind', prop.name, `$t('${localeKey}')`)
      }
      return prop
    })
  }

  if (ast.children.length) {
    ast.children = ast.children.map((child) => {
      // 普通文本
      if (child.type === 2 && hasChineseChar(child.content)) {
        const localeKey = extractChar.call(this, child.content);
        return createInterpolationNode(`$t('${localeKey}')`);
      }

      // 插值表达式
      if (
        child.type === 5
        && hasChineseChar(child.content?.content)
      ) {
        console.log('child', child)
        const jsCode = generateInterpolation(
          transformJsAst.call(
            this,
            parseJS(child.content?.content),
            { isInTemplate: true },
          ),
        );
        return createInterpolationNode(jsCode);
      }

      // 元素
      if (child.type === 1) {
        return transformTemplateAst.call(this, child);
      }

      return child
    })
  }

  return ast
}

export function transformJsAst (ast, { isInTemplate, fileType = '.vue' } = {}) {
  let shouldImportVar = false;

  const visitor = {
    Program: {
      exit: (nodePath) => {
        if (fileType === FileType.JS) {
          // 解析import语句
          nodePath.traverse({
            ImportDeclaration: (importPath) => {
              if (
                importPath.node.specifiers.find(
                  (item) => item.local.name === this.importVar,
                )
              ) {
                shouldImportVar = false;
                importPath.stop();
              }
            },
          });

          if (shouldImportVar) {
            nodePath.unshiftContainer(
              'body',
              t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier(this.importVar))],
                t.stringLiteral(this.importPath),
              ),
            );
          }
        }
      },
    },
    StringLiteral: {
      exit: (nodePath) => {
        if (hasChineseChar(nodePath.node.extra?.rawValue)) {
          const localeKey = extractChar.call(
            this,
            nodePath.node.extra?.rawValue
          )
          console.log('nodePath', nodePath)
          if (fileType === FileType.JS) {
            shouldImportVar = true;
            nodePath.replaceWith(
              t.callExpression(
                t.memberExpression(
                  t.identifier(this.importVar),
                  t.identifier('t'),
                ),
                [t.stringLiteral(localeKey)],
              ),
            );
          } else if (fileType === FileType.VUE) {
            if (isInTemplate) {
              // 如果父级不是$t 则添加$t
              if (!(nodePath.parent && nodePath.parent.callee?.name === '$t')) {
                nodePath.replaceWith(
                  t.callExpression(t.identifier('$t'), [
                    t.stringLiteral(localeKey),
                  ]),
                );
              }
            } else {
              // this.$t
              nodePath.replaceWith(
                t.callExpression(
                  t.memberExpression(t.thisExpression(), t.identifier('$t')),
                  [t.stringLiteral(localeKey)],
                ),
              );
            }
          }
        }
      },
    },
    TemplateLiteral: {
      exit: (nodePath) => {
        // 检测模板字符串内部是否含有中文字符
        if (
          nodePath.node.quasis.some((q) => hasChineseChar(q.value.cooked))
        ) {
          // 生成替换字符串，注意这里不需要过滤quasis里的空字符串
          const replaceStr = nodePath.node.quasis
            .map((q) => q.value.cooked)
            .join('%s');
          const localeKey = extractChar.call(this, replaceStr);
          const isIncludeInterpolation = !!nodePath.node.expressions?.length;
          if (fileType === FileType.JS) {
            shouldImportVar = true;
            if (isIncludeInterpolation) {
              nodePath.replaceWith(
                t.callExpression(
                  t.memberExpression(
                    t.identifier(this.importVar),
                    t.identifier('tExtend'),
                  ),
                  [
                    t.stringLiteral(localeKey),
                    t.arrayExpression(
                      nodePath.node.expressions
                    ),
                  ],
                ),
              );
            } else {
              nodePath.replaceWith(
                t.callExpression(
                  t.memberExpression(
                    t.identifier(this.importVar),
                    t.identifier('t'),
                  ),
                  [t.stringLiteral(localeKey)],
                ),
              );
            }
          } else if (fileType === FileType.VUE) {
            if (isInTemplate) {
              if (isIncludeInterpolation) {
                nodePath.replaceWith(
                  t.callExpression(
                    t.memberExpression(
                      t.identifier('$i18n'),
                      t.identifier('tExtend'),
                    ),
                    [
                      t.stringLiteral(localeKey),
                      t.arrayExpression(
                        nodePath.node.expressions
                      ),
                    ],
                  ),
                );
              } else {
                nodePath.replaceWith(
                  t.callExpression(t.identifier('$t'), [
                    t.stringLiteral(localeKey),
                  ]),
                );
              }
            } else if (isIncludeInterpolation) {
              nodePath.replaceWith(
                t.callExpression(
                  t.memberExpression(
                    t.memberExpression(
                      t.thisExpression(),
                      t.identifier('$i18n'),
                    ),
                    t.identifier('tExtend'),
                  ),
                  [
                    t.stringLiteral(localeKey),
                    t.arrayExpression(
                      nodePath.node.expressions
                    ),
                  ],
                ),
              );
            } else {
              nodePath.replaceWith(
                t.callExpression(
                  t.memberExpression(
                    t.thisExpression(),
                    t.identifier('$t'),
                  ),
                  [t.stringLiteral(localeKey)],
                ),
              );
            }
          }
        }
      },
    },
    // @babel/parse会将{{ '你好' }}解析为DirectiveLiteral
    // Property value of Directive expected node to be of a type ["DirectiveLiteral"] but instead got callExpression
    // DirectiveLiteral: {
    //   exit: nodePath => {
    //     console.log('hello', nodePath)
    //     const localeKey = extractChar.call(this, nodePath.node.extra.rawValue)
    //     if (hasChineseChar(localeKey)) {
    //       nodePath.replaceWith(
    //         t.callExpression(t.identifier('$t'), [
    //           t.stringLiteral(localeKey),
    //         ]),
    //       )
    //     }
    //   }
    // },
    JSXText: {
      exit: (nodePath) => {
        if (hasChineseChar(nodePath.node.value)) {
          const localeKey = extractChar.call(
            this,
            nodePath.node.extra?.rawValue,
          );

          nodePath.replaceWith(
            t.jsxExpressionContainer(
              t.callExpression(t.identifier('$t'), [
                t.stringLiteral(localeKey),
              ]),
            ),
          );
        }
      },
    },
  };
  console.log('ast', ast)
  babel.traverse(ast, visitor);
  return ast;
}