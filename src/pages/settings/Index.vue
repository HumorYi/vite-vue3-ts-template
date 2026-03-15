<template>
  <div class="settings">
    <h2>设置</h2>

    <RouterLinkPermission
      :to="{ name: RouteName.settings.root }"
      text="设置中心"
    />

    <RouterLinkPermission
      :to="{ name: RouteName.settings.base }"
      text="基础设置"
    />

    <RouterLinkPermission
      :to="{ name: RouteName.settings.advance.root }"
      text="高级设置"
    />

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { RouteName } from '@/config/route'
</script>

<style lang="scss" scoped></style>
