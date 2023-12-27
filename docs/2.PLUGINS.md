# 插件

## 引入插件

要想为传统浏览器提供支持，可以使用 `@vitejs/plugin-legacy`：

```shell
yarn add @vitejs/plugin-legacy -D
```

```js
// vite.config.js
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
})
```

TODO: `@vitejs/plugin-legacy` 这个插件的作用是针对什么？难道使用 `vue3` 版本，结合该插件，就能兼容 `IE`? 应该是不可行的吧。

## 强制插件排序

为了与某些 `Rollup` 插件兼容，可能需要强制修改插件的执行顺序，或者只在构建时使用。

这应该是 `Vite` 插件的实现细节。

可以使用 `enforce` 修饰符来强制插件的位置:

- `pre`：在 `Vite` 核心插件之前调用该插件
- 默认：在 `Vite` 核心插件之后调用该插件
- `post`：在 `Vite` 构建插件之后调用该插件

```js
// vite.config.js
import image from '@rollup/plugin-image'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...image(),
      enforce: 'pre'
    }
  ]
})
```

## 区分插件环境

默认情况下插件在开发 (`serve`) 和生产 (`build`) 模式中都会调用。

如果插件在服务或构建期间按需使用，请使用 `apply` 属性指明它们仅在 '`build`' 或 '`serve`' 模式时调用：

```js
// vite.config.js
import typescript2 from 'rollup-plugin-typescript2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build',
    },
  ],
})
```
