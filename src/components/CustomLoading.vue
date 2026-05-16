<script lang="ts" setup>
const loadingStore = useLoadingStore()
</script>

<template>
  <div v-if="loadingStore.state.global" class="global-loading">global</div>

  <div v-if="loadingStore.state.test" class="global-loading">test</div>
</template>

<style>
.global-loading {
  /* position: fixed; */
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: white;
  background: rgb(0, 0, 0, 50%);
  user-select: none;
}
</style>
