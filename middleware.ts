import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Basic admin protection - we'll enhance this later
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For now, just allow access - we'll add proper auth later
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}