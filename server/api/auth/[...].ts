import CredentialsProvider from 'next-auth/providers/credentials'

import GithubProvider from 'next-auth/providers/github'

import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

// @ts-ignore
import bcrypt from 'bcrypt'
import { NuxtAuthHandler } from '#auth'

const prisma = new PrismaClient()

async function refreshAccessToken (refreshToken: {
  accessToken: string;
  accessTokenExpires: string;
  refreshToken: string;
}) {
  try {
    console.warn('trying to post to refresh token')
    const refreshedTokens = await $fetch<{
      data: {
        access_token: string;
        expires: number;
        refresh_token: string;
      };
    } | null>('https://domain.directus.app/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        refresh_token: refreshToken.refreshToken,
        mode: 'json'
      }
    })
    if (!refreshedTokens || !refreshedTokens.data) {
      console.warn('No refreshed tokens')
      throw refreshedTokens
    }
    console.warn('Refreshed tokens successfully')
    return {
      ...refreshToken,
      accessToken: refreshedTokens.data.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.data.expires,
      refreshToken: refreshedTokens.data.refresh_token
    }
  } catch (error) {
    console.warn('Error refreshing token', error)
    return {
      ...refreshToken,
      error: 'RefreshAccessTokenError'
    }
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
  },

  callbacks: {
    async jwt ({ token, user, account }) {
      if (account && user) {
        console.warn('JWT callback', { token, user, account })
        return {
          ...token,
          ...user
        }
      }
      // Handle token refresh before it expires of 15 minutes
      if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
        console.warn('Token is expired. Getting a new')
        return await refreshAccessToken(token)
      }
      return token
    },
    async session ({ session, token }) {
      session.user = {
        ...session.user,
        ...token
      }
      return session
    }
  }
})
