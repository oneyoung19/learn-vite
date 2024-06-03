<template>
  <div class="about">
    <p>This is About Page</p>
    <p>{{ `count is ${count} ?` }}</p>
    <button @click="count++">add</button>
    <HelloWorld></HelloWorld>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'

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
  }
}
</script>

<style scoped lang="less">
.about {
  background-color: skyblue;
}
</style>
