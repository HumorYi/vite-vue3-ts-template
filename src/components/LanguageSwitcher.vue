<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { STORAGE_KEY } from '@/config/i18n'

const { locale } = useI18n()

const locales = [
  { code: 'zh', name: '简体中文' },
  { code: 'zh-Hant', name: '繁体中文' },
  { code: 'en', name: 'English' }
]

function setLocale(code: string) {
  locale.value = code

  localStorage.setItem(STORAGE_KEY, code)
}
</script>

<template>
  <div class="language-switcher">
    <button
      v-for="loc in locales"
      :key="loc.code"
      :class="{ active: locale === loc.code }"
      class="locale-item"
      @click="setLocale(loc.code)"
    >
      {{ loc.name }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.language-switcher {
  position: fixed;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  align-items: center;

  .locale-item {
    padding: 4px 12px;
    font-size: 14px;
    border-radius: 4px;
    text-decoration: none;
    color: var(--text-color);
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
      background-color: var(--hover-bg);
    }

    &.active {
      color: white;
      background-color: var(--primary-color);
    }
  }
}
</style>
