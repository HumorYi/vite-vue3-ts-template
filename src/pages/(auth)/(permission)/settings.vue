<script lang="ts" setup>
const routes = [
  { path: '/settings', text: 'home' },
  { path: '/settings/base', text: 'base' },
  { path: '/settings/advance', text: 'advance' }
].filter(item => usePermissionPage(item.path))
</script>

<template>
  <div>
    settings

    <ul>
      <li v-for="item in routes" :key="item.path">
        <nav>
          <RouterLink :to="item.path">
            {{ item.text }}
          </RouterLink>
        </nav>
      </li>
    </ul>

    <router-view />
  </div>
</template>

<style lang="scss" scoped></style>
