import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Get user from auth token
    const user = await verifyAuth()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
