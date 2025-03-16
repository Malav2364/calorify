const { getToken } = require("next-auth/jwt");
const { NextResponse } = require("next/server");

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
  }
  return NextResponse.next(); // Allows request to proceed
}

export const config = {
  matcher: ["./api/tasks/:path*"],
};