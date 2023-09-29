<template>
  <div class="login">
    <TheAuthForm />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/about'
  }
})
</script>
