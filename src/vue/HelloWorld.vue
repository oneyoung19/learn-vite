<template>
  <div>
    <span title="标题"></span>
    <span :title="$t('标题2')"></span>
    <span>你好吗</span>
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
