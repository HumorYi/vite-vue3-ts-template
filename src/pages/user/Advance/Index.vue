<template>
  <div class="advance">
    <h2>高级用户</h2>

    <RouterLinkPermission
      :to="{ name: RouteName.user.advance.root }"
      text="高级用户中心"
    />

    <RouterLinkPermission
      :to="{ name: RouteName.user.advance.base }"
      text="高级用户 - 基础"
    />

    <RouterLinkPermission
      :to="{ name: RouteName.user.advance.other }"
      text="高级用户 - 其它"
    />

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { RouteName } from '@/config/route'
</script>

<style lang="scss" scoped></style>
