<template>
  <div id="app">
    <div v-if="!($route.meta && $route.meta.hiddenMenu)">
      <router-link :to="{ name: 'Home' }">Home</router-link> |
      <router-link :to="{ name: 'HMR' }">HMR</router-link> |
      <router-link :to="{ name: 'Store' }">Store</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>

<style scoped lang="less">
#app {
  margin-top: 20px;
  // border: 1px solid #000;
}
</style>
