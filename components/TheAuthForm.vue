<template>
  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
      <form action="" class="space-y-6" @submit.prevent="onSubmit">
        <!-- Input  -->
        <TheInput
          v-if="variant === 'REGISTER'"
          id="name"
          v-model="name"
          :disabled="isLoading"
          required
          label="Name"
          name="name"
          type="text"
        />

        <TheInput
          id="email"
          v-model="email"
          :disabled="isLoading"
          required
          label="Email"
          name="email"
          type="email"
        />
        <TheInput
          id="password"
          v-model="password"
          :disabled="isLoading"
          required
          label="password"
          name="password"
          type="password"
        />
        <div>
          <TheButton :disabled="isLoading" full-width type="submit">
            {{ variant === 'LOGIN' ? 'Sing In' : 'Register' }}
          </TheButton>
        </div>
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-white px-2 text-gray-500"> Or Continue with </span>
            </div>
          </div>
        </div>
        <div class="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <div @click="toggleVariant">
            {{
              variant === 'REGISTER' ? 'New to Messenger?' : 'Already have an account?'
            }}
          </div>
          <div class="underline cursor-pointer" @click="toggleVariant">
            {{ variant === 'LOGIN' ? 'Create an account' : 'Login' }}
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">

const isLoading = ref(false)
const name = ref('')
const password = ref('')
const email = ref('')

const { signIn } = useAuth()

  type VARIANT = 'LOGIN' | 'REGISTER';
const variant = ref<VARIANT>('REGISTER')

const onSubmit = async () => {
  if (variant.value === 'REGISTER') {
    try {
      isLoading.value = true
      const { data, error } = await useFetch('/api/auth/register', {
        method: 'POST',
        body: {
          name: name.value,
          password: password.value,
          email: email.value
        }
      })
      if (error.value) {
        console.log(error.value)
      }
      if (data.value) {
        console.log('Successfully Registered')
      }
    } catch (error) {
    } finally {
      isLoading.value = false
    }
  } else {
    try {
      isLoading.value = true

      const result = await signIn('credentials', {
        password: password.value,
        email: email.value,
        callbackUrl: '/about'
      })
      if (result?.ok && !result.error) {
        console.log('Successfully LoggedIn')
      } else {
        console.log('Something Weent Wrong')
      }
    } catch (error) {
    } finally {
      isLoading.value = false
    }
  }
}
const toggleVariant = () => {
  if (variant.value === 'REGISTER') {
    variant.value = 'LOGIN'
  } else {
    variant.value = 'REGISTER'
  }
}
</script>

  <style scoped></style>
