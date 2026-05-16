<script setup lang="ts">
const langPage = useLangPage('catchAllRoute')
</script>

<template>
  <BackHome :text="langPage('noFound')" />
</template>

<style lang="scss" scoped></style>
