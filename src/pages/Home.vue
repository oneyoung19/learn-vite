<template>
  <div>This is Home Page</div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  mounted () {
    const arrowFn = () => {
      console.log('Arrow Function')
    }
    arrowFn()
  },
  methods: {
  }
}
</script>

<style scoped lang="less">
</style>
