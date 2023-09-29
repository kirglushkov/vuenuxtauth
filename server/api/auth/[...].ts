import CredentialsProvider from 'next-auth/providers/credentials'

import GithubProvider from 'next-auth/providers/github'

import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

// @ts-ignore
import bcrypt from 'bcrypt'
import { NuxtAuthHandler } from '#auth'

const prisma = new PrismaClient()

async function fetchRefreshedToken (refreshToken) {
  // Implement your logic here to make the API call and get a new access token using the refresh token

  // Return the refreshed token
  return {
    access_token: 'new-access-token',
    expires_in: 3600 // Expiry time in seconds
  }
}

export default NuxtAuthHandler({
  // your authentication configuration here!
  adapter: PrismaAdapter(prisma),
  secret: 'your-secret-here',
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    GithubProvider.default({
      clientId: useRuntimeConfig().githubId,
      clientSecret: useRuntimeConfig().githubSecret
    }),
    // @ts-expect-error
    GoogleProvider.default({
      clientId: useRuntimeConfig().googleId,
      clientSecret: useRuntimeConfig().googleSecret
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({

      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'email' },
        password: { type: 'password', label: 'password' }
      },
      async authorize (credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          throw createError({
            statusCode: 500,
            statusMessage: 'Missing Info'
          })
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.hashedPassword) {
          throw createError({
            statusCode: 401,
            statusMessage: 'Invalid Credentials'
          })
        }

        const correctPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )
        if (!correctPassword) {
          throw createError({
            statusCode: 401,
            statusMessage: 'Invalid Credentials'
          })
        }
        return user
      }
    })

  ],
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  }
})
