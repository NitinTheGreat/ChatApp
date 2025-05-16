import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import connectToDatabase from "./mongodb"
import User from "@/models/user"

export async function verifyAuth() {
  try {
    // Get token from cookies
    const token = cookies().get("auth_token")?.value

    if (!token) {
      return null
    }

    // Verify token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret")
    const { payload } = await jwtVerify(token, secret)

    if (!payload || !payload.userId) {
      return null
    }

    // Connect to database
    await connectToDatabase()

    // Find user
    const user = await User.findById(payload.userId).select("-password")

    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.error("Auth verification error:", error)
    return null
  }
}
