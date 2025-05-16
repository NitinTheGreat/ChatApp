import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Get user from auth token
    const user = await verifyAuth()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Get contacts
    const contacts = await db.collection("contacts").find({ userId: user._id }).toArray()

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Get contacts error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // Get user from auth token
    const user = await verifyAuth()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, email } = await req.json()

    // Validate input
    if (!name || !email) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if contact already exists
    const existingContact = await db.collection("contacts").findOne({
      userId: user._id,
      email,
    })

    if (existingContact) {
      return NextResponse.json({ message: "Contact already exists" }, { status: 409 })
    }

    // Create contact
    const result = await db.collection("contacts").insertOne({
      userId: user._id,
      name,
      email,
      status: "offline",
      lastSeen: new Date(),
      createdAt: new Date(),
    })

    // Get created contact
    const contact = await db.collection("contacts").findOne({
      _id: result.insertedId,
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Create contact error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
