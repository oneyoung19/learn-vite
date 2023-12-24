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

