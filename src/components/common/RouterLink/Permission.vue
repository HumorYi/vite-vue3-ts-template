<template>
  <router-link v-if="hasRoutePermission(props.to.name as string)" :to="to">
    {{ text }}
  </router-link>
</template>

<script setup lang="ts">
import { hasRoutePermission } from '@/utils/route'
import { type RouteLocationAsRelativeGeneric } from 'vue-router'

const props = defineProps<{
  to: RouteLocationAsRelativeGeneric
  text: string
}>()
</script>

<style lang="sass" scoped></style>
