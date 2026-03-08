<script setup lang="ts">
import { useApiOption } from '@/composables/useApiOption'
import { useUserStore } from '@/store/useUserStore'
import { useTimeout } from '@vueuse/core'

const useStore = useUserStore()
const param = { name: 'signal' }
const apiOption = useApiOption()

// apiSetUser(param, apiOption)
useStore.setUser(param, param, apiOption)

useTimeout(2000, {
  callback: () => {
    console.log('hhah')
  }
})
</script>

<template>
  <div class="user">更改用户名为：signal</div>
</template>

<style lang="scss" scoped></style>
