import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

const publicPaths = ['/login']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get('session')?.value
  const session = token ? await decrypt(token) : null

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
