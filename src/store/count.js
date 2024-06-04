import { defineStore, acceptHMRUpdate } from 'pinia'

export const useCountStore = defineStore('count', {
  state () {
    return {
      count: 10
    }
  },
  actions: {
    setCount () {
      this.count++
    }
  }
})

// 1、如果不添加此行 那么虽然Store.vue和count.js在客户端都会发生HMR请求，但并不会更新
// 2、添加此行后，只有count.js会发生HMR请求，且如果更改state的话 增删操作会及时HMR 修改操作并不会
// 关于第2条的结论，可以参考[#843](https://github.com/vuejs/pinia/issues/843)
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCountStore, import.meta.hot))
}
