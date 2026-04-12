import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

/**
 * Call at the top of any API route handler that should be authenticated.
 * Returns a 401 response if no session exists, null otherwise.
 *
 * Usage:
 *   const unauth = await requireAuth()
 *   if (unauth) return unauth
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
