'use server'

import { timingSafeEqual } from 'crypto'
import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/lib/session'

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, Buffer.alloc(bufA.length))
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

export async function login(prevState: { error?: string } | undefined, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  const validUser = safeEqual(username, process.env.AUTH_USERNAME ?? '')
  const validPass = safeEqual(password, process.env.AUTH_PASSWORD ?? '')

  if (!validUser || !validPass) {
    return { error: 'Credenziali non valide' }
  }

  await createSession(username)
  redirect('/')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
