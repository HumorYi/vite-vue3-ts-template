<script lang="ts" setup>
const langPage = useLangPage()
const authStore = useAuthStore()

async function login() {
  await authStore.login({
    username: 'username',
    password: 'password',
  })
}
</script>

<template>
  <div>
    <button @click="login">
      {{ langPage('login') }}
    </button>
  </div>
</template>

<style lang="scss" scoped></style>
