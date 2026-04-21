'use server'

import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/lib/session'

export async function login(prevState: { error?: string } | undefined, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (
    username !== process.env.AUTH_USERNAME ||
    password !== process.env.AUTH_PASSWORD
  ) {
    return { error: 'Credenziali non valide' }
  }

  await createSession(username)
  redirect('/')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
