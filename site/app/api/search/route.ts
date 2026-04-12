import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/require-auth"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function GET() {
  const unauth = await requireAuth()
  if (unauth) return unauth

  try {
    const indexPath = path.join(process.cwd(), "data", "search-index.json")
    const raw = fs.readFileSync(indexPath, "utf-8")
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (err) {
    console.error("[search] Failed to read search index:", err)
    return NextResponse.json([], { status: 200 })
  }
}
