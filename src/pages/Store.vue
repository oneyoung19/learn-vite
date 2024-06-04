<template>
  <div>
    <p>Store</p>
    <p>count is {{ count }}</p>
    <button @click="handleAddCount">Add count</button>
    <p>{{ myResult }}</p>
  </div>
</template>

<script>
import { useCountStore } from '@/store/count'
import { mapState, mapActions } from 'pinia'
import { result } from '@/utils/utils'

export default {
  data () {
    return {
      result
    }
  },
  computed: {
    ...mapState(useCountStore, ['count']),
    myResult () {
      return this.result
    }
  },
  methods: {
    ...mapActions(useCountStore, ['setCount']),
    handleAddCount () {
      this.setCount()
    }
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(mod => {
    console.warn(mod, mod._rerender_only)
    console.dir(useCountStore())
  })
}
</script>

<style scoped lang="less">
</style>
