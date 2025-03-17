import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  // For API routes that need protection
  if (req.nextUrl.pathname.startsWith('/api/dishes')) {
    const session = await getToken({ 
      req, 
      secret: process.env.NEXT_SECRET 
    });
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized Access" }, 
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/dishes/:path*']
};