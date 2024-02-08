import generator from '@babel/generator';
const babelGenerator = generator.default
import prettier from 'prettier';

function generateElementAttr(attrs) {
  return attrs
    .map(attr => attr.loc.source)
    .join(' ')
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
  // console.log(templateAst)
  if (templateAst?.children?.length) {
    children = templateAst.children.reduce((result, child) => result + generateTemplate(child), '');
  }
  
  // ROOT Node
  if (templateAst.type === 0) {
    return generateElement(templateAst, children)
  }

  // Element Node
  if (templateAst.type === 1) {
    return generateElement(templateAst, children);
  }

  return templateAst.loc.source;
}

export function generateInterpolation(ast) {
  // @babel/generator will generate a semi after a callexpression, so remove it manually.
  return babelGenerator(ast, {
    compact: false,
    jsescOption: {
      // [set mimimal to avoid escape sequence](https://github.com/babel/babel/issues/4909)
      minimal: true
    },
  }).code.replace(/;/gm, '')
}

export function generateJS(ast) {
  return babelGenerator(ast).code
}

export function generateSFC(descriptor) {
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
