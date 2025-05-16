import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    // Get user from auth token
    const user = await verifyAuth()

    if (user) {
      // Connect to database
      const { db } = await connectToDatabase()

      // Update user status
      await db.collection("users").updateOne({ _id: user._id }, { $set: { status: "offline", lastSeen: new Date() } })
    }

    // Clear auth cookie
    cookies().delete("auth_token")

    return NextResponse.json({ message: "Logout successful" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
