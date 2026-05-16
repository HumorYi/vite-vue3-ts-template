<script setup lang="ts">
defineProps<{ text?: string }>()

const langComponent = useLangComponent()
</script>

<template>
  <div class="py-10 text-center">
    <h1 class="text-3xl font-bold">
      {{ text }}
    </h1>

    <button
      class="mt-6 rounded px-6 py-2 text-white bg-blue-600"
      @click="$router.push('/')"
    >
      {{ langComponent('backHome') }}
    </button>
  </div>
</template>

<style lang="scss" scoped></style>
