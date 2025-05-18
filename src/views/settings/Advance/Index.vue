<template>
  <div class="advance">
    <h2>高级设置</h2>

    <RouterLinkPermission
      :to="{ name: RouteName.settings.advance.root }"
      text="高级设置中心"
    />

    <RouterLinkPermission
      :to="{ name: RouteName.settings.advance.base }"
      text="高级设置 - 基础"
    />

    <RouterLinkPermission
      :to="{ name: RouteName.settings.advance.other }"
      text="高级设置 - 其它"
    />

    <router-view />
  </div>
</template>

<script setup lang="ts" name="Advance">
import { RouteName } from '@/config/router'
</script>

<style lang="sass" scoped></style>
