import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")

  if (host === "tool-index-tau.vercel.app") {
    return NextResponse.next()
  }

  // Allow other requests to pass through without modification
  return NextResponse.next()
}

export const config = {
  matcher: "/:path*",
}
