import { setAbsoluteSqliteDatabaseUrlForPrisma } from './prisma/utils'

setAbsoluteSqliteDatabaseUrlForPrisma()

export default defineNuxtConfig({
  runtimeConfig: {
    version: '0.0.1',
    authSecret: '', // can be overridden by NUXT_AUTH_SECRET environment variable
    githubId: '',
    githubSecret: '',
    googleId: '',
    googleSecret: '',
    authOrigin: ''
  },
  modules: ['@nuxtjs/tailwindcss', '@sidebase/nuxt-auth', 'nuxt-svgo', '@huntersofbook/naive-ui-nuxt'],
  extends: ['@sidebase/core'],
  typescript: {
    shim: false
  }
})
