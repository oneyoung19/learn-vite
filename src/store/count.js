import { defineStore } from 'pinia'

export const useCountStore = defineStore('count', {
  state: {
    count: 0
  },
  actions: {
    setCount () {
      this.count++
    }
  }
})
