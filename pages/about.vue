<template>
  <pre>{{ token || 'no token present, are you logged in?' }}</pre>
</template>
<script setup lang="ts">
definePageMeta({ auth: true })
const headers = useRequestHeaders(['cookie']) as HeadersInit
const { data: token } = await useFetch('/api/token', { headers })
</script>
