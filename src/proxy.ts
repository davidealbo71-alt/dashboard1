import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const publicPaths = ['/login']

async function verifySession(token: string) {
  try {
    const key = new TextEncoder().encode(process.env.SESSION_SECRET)
    await jwtVerify(token, key, { algorithms: ['HS256'] })
    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get('session')?.value
  const valid = token ? await verifySession(token) : false

  if (!valid) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)', '/api/(.*)'],
}
