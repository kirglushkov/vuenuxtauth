<template>
  <div>
    <TheNavBar />
    <div
      class="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-100"
    >
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <div v-if="status === 'unauthenticated'">
        <NuxtLink to="/login">
          login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  status

} = useAuth()
definePageMeta({ auth: false })
</script>

<style scoped></style>
