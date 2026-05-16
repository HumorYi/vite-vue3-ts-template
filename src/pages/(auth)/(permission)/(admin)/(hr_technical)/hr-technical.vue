<script setup lang="ts">
const routes = [
  { path: '/hr', text: 'hr' },
  { path: '/technical', text: 'technical' }
].filter(item => usePermissionPage(item.path))
</script>

<template>
  <div class="hr-technical">
    hr-technical

    <ul>
      <li v-for="item in routes" :key="item.path">
        <nav>
          <RouterLink :to="item.path">
            {{ item.text }}
          </RouterLink>
        </nav>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped></style>
