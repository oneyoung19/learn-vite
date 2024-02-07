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
  console.log(char)
  // const locale = char.trim();
  // const key = generateHash(locale);
  // this.locales[key] = locale;
  // return key;
  return char.trim()
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
    // @ts-expect-error 类型“{ name: string; type: number; loc: { source: string; }; }”缺少类型“DirectiveNode”中的以下属性: exp, arg, modifiersts(2322)
    ast.props = ast.props.map((prop) => {
      // vue指令
      if (
        prop.type === 7
        && hasChineseChar(prop.exp?.content)
      ) {
        const jsCode = generateInterpolation(
          transformJsAst(parseJS(prop.exp?.content), { isInTemplate: true }),
        );
        return createDirectiveAttr(
          prop.name,
          prop.arg?.content,
          jsCode,
        );
      }
      // 普通属性
      if (prop.type === 6 && hasChineseChar(prop.value?.content)) {
        const localeKey = extractChar(prop.value?.content);
        return createDirectiveAttr('bind', prop.name, `$t('${localeKey}')`);
      }
      
      return prop;
    });
  }

  if (ast.children.length) {
    // @ts-expect-error 类型“{ type: number; loc: { source: string; }; }”缺少类型“TextCallNode”中的以下属性: content, codegenNodets(2322)
    ast.children = ast.children.map((child) => {
      if (child.type === 2 && hasChineseChar(child.content)) {
        const localeKey = extractChar(child.content);
        return createInterpolationNode(`$t('${localeKey}')`);
      }

      // 插值语法，插值语法的内容包含在child.content内部，如果匹配到中文字符，则进行JS表达式解析并替换
      if (
        child.type === 5
        && hasChineseChar(child.content?.content)
      ) {
        const jsCode = generateInterpolation(
          transformJsAst(
            parseJS(child.content?.content),
            { isInTemplate: true },
          ),
        );
        return createInterpolationNode(jsCode);
      }

      // 元素
      if (child.type === 1) {
        return transformTemplateAst(child);
      }

      return child;
    });
  }

  return ast;
}

export function transformJsAst (ast, { isInTemplate, fileType = '.vue' } = {}) {
  // const ast = parseJS(code);
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
          const localeKey = extractChar(
            nodePath.node.extra?.rawValue,
          );

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
              nodePath.replaceWith(
                t.callExpression(t.identifier('$t'), [
                  t.stringLiteral(localeKey),
                ]),
              );
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
          const localeKey = extractChar(replaceStr);
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
    JSXText: {
      exit: (nodePath) => {
        if (hasChineseChar(nodePath.node.value)) {
          const localeKey = extractChar(
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

  babel.traverse(ast, visitor);
  return ast;
}