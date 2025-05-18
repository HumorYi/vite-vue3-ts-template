<template>
  <div class="login">
    <button @click="login">登录</button>
  </div>
</template>

<script setup lang="ts" name="Login">
import { useUserStore } from '@/store/useUserStore'

const userStore = useUserStore()

const login = async () => {
  await userStore.login()
}
</script>

<style lang="sass" scoped></style>
