export let hmrData = [1, 2, 3, 4]

// 如果没有这段代码的话 更新hmr.js时 客户端会优先读取其父模块 即本例中的About.vue文件 然后再读取新的hmr.js
// 利用build打包时 该段代码会自动tree shaking优化掉
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    hmrData = newModule.hmrData
    // 更改此处accept块的逻辑 会发现HMR执行的是上一次的accept函数 这与vite源码是一致的 在fetchUpdate之前会先把accept函数备份读取一份
    console.log(hmrData)
    // 该操作会使得已有的传播边界失效 继续向上搜索边界以更新
    // import.meta.hot.invalidate()
    // 该操作 传播边界依旧有效 但会停止热更新
    // import.meta.hot.decline()
  })
}
