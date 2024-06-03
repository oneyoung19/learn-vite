<template>
  <div class="about">
    <p>This is About Page</p>
    <p>{{ `count is ${count} ?` }}</p>
    <button @click="count++">Add</button>
    <button @click="handleHmrData">Get HMR Data</button>
    <HelloWorld></HelloWorld>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'
import { hmrData } from '@/utils/hmr.js'

export default {
  components: {
    HelloWorld
  },
  data () {
    return {
      count: 0
    }
  },
  methods: {
    handleHmrData () {
      console.log(hmrData)
    }
  }
}
</script>

<style scoped lang="less">
.about {
  background-color: skyblue;
}
</style>
