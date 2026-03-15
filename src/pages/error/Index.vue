<template>
  <div class="not-container">
    <img
      :src="getErrorPageImageUrl(`${code}`)"
      class="not-img"
      :alt="code + ''"
    />

    <div class="not-detail">
      <h2>{{ code }}</h2>

      <h4>{{ tip }}</h4>

      <button @click="toHome">
        {{ btn }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getErrorPageImageUrl } from '@/utils/resource'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const { code, tip, btn } = route.meta

const toHome = () => router.push('/')
</script>

<style scoped lang="scss">
.not-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 90vh;

  .not-img {
    margin-right: 120px;
  }

  .not-detail {
    display: flex;
    flex-direction: column;
  }

  h2,
  h4 {
    margin: 0;
    padding: 0;
  }

  h2 {
    font-size: 60px;
  }

  h4 {
    margin: 30px 0 20px;
    font-size: 19px;
    font-weight: normal;
  }

  button {
    width: 100px;
  }
}
</style>
