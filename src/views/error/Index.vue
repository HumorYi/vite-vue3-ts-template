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

<script setup lang="ts" name="ErrorPage">
import { useRouter } from 'vue-router'
import { getErrorPageImageUrl } from '@/utils/resource'

const { code, tip, btn } = defineProps<{
  code: number
  tip: string
  btn: string
}>()

const router = useRouter()

const toHome = () => router.push('/')
</script>

<style scoped lang="sass">
.not-container
  display: flex
  align-items: center
  justify-content: center
  width: 100%
  height: 90vh

  .not-img
    margin-right: 120px

  .not-detail
    display: flex
    flex-direction: column

    h2,
    h4
      padding: 0
      margin: 0

    h2
      font-size: 60px

    h4
      margin: 30px 0 20px
      font-size: 19px
      font-weight: normal

    .button
      width: 100px
</style>
