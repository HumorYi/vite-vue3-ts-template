<template>
  <router-link v-if="hasRoutePermission(props.to.name as string)" :to="to">
    {{ text }}
  </router-link>
</template>

<script setup lang="ts" name="RouterLinkPermission">
import { type RouteLocationAsRelativeGeneric } from 'vue-router'
import { hasRoutePermission } from '@/utils/route'

const props = defineProps<{
  to: RouteLocationAsRelativeGeneric
  text: string
}>()
</script>

<style lang="sass" scoped></style>
