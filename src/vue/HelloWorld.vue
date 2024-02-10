<template>
  <div>
    <span title="标题"></span>
    <span :title="$t('标题2')"></span>
    <span>你好吗</span>
    <span>{{ '你好吗' }}</span>
    <span>{{ `你好吗` }}</span>
    <span>{{ $t('你好吗') }}</span>
    <p>{{ en ? '英文' : '中文' }}</p>
    <!-- 注释 -->
  </div>
</template>

<script>
export default {
  data () {
    return {
      en: true
    }
  },
  created () {
    console.log(this.$t('脚本执行1'))
    console.log(this.$t(`脚本执行2`))
    console.log(this.$t(`脚本执行${1+2}`))
    const result = true ? this.$t('脚本执行4') : this.$t('脚本执行5')
    console.log(result)
  },
  methods: {
  }
}
</script>

<style scoped lang="less">
.container {
  width: 100%;
}
</style>
