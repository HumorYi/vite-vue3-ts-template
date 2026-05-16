<script setup lang="ts">
const langLayout = useLangLayout()
</script>

<template>
  <div class="size-full">
    <header>{{ langLayout('header') }}</header>

    <LanguageSwitcher />

    <router-view />

    <footer>{{ langLayout('footer') }}</footer>
  </div>
</template>
