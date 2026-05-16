<script setup lang="ts">
const langUserPage = useLangUserPage()

const routes = [
  { path: '/user', text: langUserPage('backToUserHome') },
  { path: '/user/base', text: langUserPage('basicInfo') },
  { path: '/user/advance', text: langUserPage('advancedSettings') }
].filter(item => usePermissionPage(item.path))
</script>

<template>
  <div class="index">
    <h2>{{ langUserPage('userCenterParent') }}</h2>

    <!-- 子路由导航 -->
    <ul>
      <li v-for="item in routes" :key="item.path">
        <RouterLink :to="item.path">
          {{ item.text }}
        </RouterLink>
      </li>
    </ul>

    <div
      class="child-route-container"
      style="margin-top: 20px; padding: 10px; border: 1px solid #eee"
    >
      <router-view />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.index {
  padding: 20px;
  ul {
    padding: 0;
    list-style: none;
    > li {
      margin: 10px 0;
      a {
        text-decoration: none;
        color: #333;
        &.nuxt-link-active {
          font-weight: bold;

          // 激活态样式（可选）
          color: #409eff;
        }
      }
    }
  }
  .child-route-container {
    background: #f9f9f9;
  }
}
</style>
