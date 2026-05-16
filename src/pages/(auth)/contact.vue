<script setup lang="ts">
const langAuthPage = useLangAuthPage()
</script>

<template>
  <div class="contact bg-d">
    {{ langAuthPage('desc') }}
  </div>
</template>

<style lang="scss" scoped>
.contact {
  width: 200px;
  height: 200px;
  background-color: vars.$bgColor-container;
}
</style>
