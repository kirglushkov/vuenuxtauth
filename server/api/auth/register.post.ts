import { PrismaClient } from '@prisma/client'

import { H3Event, createError, defineEventHandler, readBody } from 'h3'

// @ts-ignore
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { name, email, password } = await readBody(event)
    if (!email || !name || !password) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Info'
      })
    }
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        name
      }
    })

    return { user }
  } catch (error) {
    console.error(error)
  }
})
