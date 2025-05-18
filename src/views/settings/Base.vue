<template>
  <div class="base">
    {{ route.meta.menuName }}
  </div>
</template>

<script setup lang="ts" name="Base">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style lang="sass" scoped></style>
