<script setup lang="ts">
const userStore = useUserStore()
const authStore = useAuthStore()
</script>

<template>
  <div class="bg-d">
    <button v-if="userStore.isLogin" @click="authStore.logout">logout</button>
    <RouterLink v-else to="/login">login</RouterLink>
  </div>
</template>

<style lang="scss" scoped></style>
