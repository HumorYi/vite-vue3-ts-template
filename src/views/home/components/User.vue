<script setup lang="ts">
import { apiSetUser } from '@/api/user'
import { useApiSignal } from '@/composables/useApiSignal'
import { useUserStore } from '@/store/useUserStore'

const useStore = useUserStore()
const param = { name: 'signal' }
const apiOption = useApiSignal()

// useStore.setUser(param, param, apiOption)

apiSetUser(param, apiOption)
</script>

<template>
  <div class="user">更改用户名为：signal</div>
</template>

<style lang="scss" scoped></style>
