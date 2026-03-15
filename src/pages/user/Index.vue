<template>
  <div class="user">
    <h2>用户</h2>

    <RouterLinkPermission :to="{ name: RouteName.user.root }" text="用户中心" />

    <RouterLinkPermission :to="{ name: RouteName.user.base }" text="基础用户" />

    <RouterLinkPermission
      :to="{ name: RouteName.user.advance.root }"
      text="高级用户"
    />

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { RouteName } from '@/config/route'
</script>

<style lang="scss" scoped></style>
