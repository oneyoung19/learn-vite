import generator from '@babel/generator';
const babelGenerator = generator.default
import prettier from 'prettier';

function generateElementAttr(attrs) {
  return attrs
    .map((attr) => attr.loc.source)
    .join(' ');
}

/**
 * 生成template内部JS表达式
 * 字符串需要使用单引号
 * 函数调用末尾的分号需要移除
 */
export function generateInterpolation(ast) {
  // that's a hack, because @babel/generator will give a semi after a callexpression
  return babelGenerator(ast, {
    compact: false,
    jsescOption: {
      quotes: 'single',
    },
  }).code.replace(/;/gm, '');
}

/**
 * 生成script内部的JS
 */
export function generateJS(ast) {
  return babelGenerator(ast).code;
}

/**
 * 组合template，script，style
 */
export function generateSfc(descriptor) {
  let result = '';

  const {
    template, script, scriptSetup, styles, customBlocks,
  } = descriptor;
  [template, script, scriptSetup, ...styles, ...customBlocks].forEach(
    (block) => {
      if (block && typeof block.type !== 'undefined') {
        result += `<${block.type}${Object.entries(block.attrs).reduce(
          (attrCode, [attrName, attrValue]) => {
            if (attrValue === true) {
              attrCode += ` ${attrName}`;
            } else {
              attrCode += ` ${attrName}="${attrValue}"`;
            }

            return attrCode;
          },
          ' ',
        )}>${block.content}</${block.type}>`;
      }
    },
  );
  // console.log(descriptor, result)
  // return result
  return prettier.format(result, {
    parser: 'vue',
    semi: true,
    singleQuote: true,
  });
}

function generateElement(node, children) {
  let attributes = '';

  if (node.props && node.props.length) {
    attributes = ` ${generateElementAttr(node.props)}`;
  }

  if (node.tag) {
    // 自关闭标签：https://html.spec.whatwg.org/multipage/syntax.html#void-elements
    const selfClosingTags = [
      'area',
      'base',
      'br',
      'col',
      'embed',
      'hr',
      'img',
      'input',
      'link',
      'meta',
      'param',
      'source',
      'track',
      'wbr',
    ];

    if (node.isSelfClosing || selfClosingTags.includes(node.tag)) {
      return `<${node.tag}${attributes} />`;
    }

    return `<${node.tag}${attributes}>${children}</${node.tag}>`;
  }

  return children;
}

export function generateTemplate(templateAst, children = '') {
  console.log(templateAst)
  // @ts-expect-error 类型“InterpolationNode”上不存在属性“children”。
  if (templateAst?.children?.length) {
    // @ts-expect-error 类型“InterpolationNode”上不存在属性“children”
    children = templateAst.children.reduce((result, child) => result + generateTemplate(child), '');
  }
  
  // 根节点
  if (templateAst.type === 0) {
    // return `<template>${generateElement(templateAst, children)}</template>`
    return generateElement(templateAst, children)
  }

  // 元素节点
  if (templateAst.type === 1) {
    return generateElement(templateAst, children);
  }

  return templateAst.loc.source;
}
