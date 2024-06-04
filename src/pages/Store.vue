<template>
  <div>
    <p>Store</p>
    <p>count is {{ count }}</p>
    <button @click="handleAddCount">Add count</button>
  </div>
</template>

<script>
import { useCountStore } from '@/store/count'
import { mapState, mapActions } from 'pinia'

export default {
  data () {
    return {
    }
  },
  computed: {
    ...mapState(useCountStore, ['count'])
  },
  methods: {
    ...mapActions(useCountStore, ['setCount']),
    handleAddCount () {
      this.setCount()
    }
  }
}
</script>

<style scoped lang="less">
</style>
