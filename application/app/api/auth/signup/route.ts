import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      status: "offline",
      lastSeen: new Date(),
      createdAt: new Date(),
    })

    // Create a few sample contacts for the new user
    const sampleContacts = [
      {
        name: "John Doe",
        email: "john@example.com",
        status: "online",
        lastSeen: new Date(),
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        status: "offline",
        lastSeen: new Date(Date.now() - 3600000),
      },
      {
        name: "Alex Johnson",
        email: "alex@example.com",
        status: "away",
        lastSeen: new Date(Date.now() - 1800000),
      },
    ]

    // Insert sample contacts
    const contactsResult = await db.collection("contacts").insertMany(
      sampleContacts.map((contact) => ({
        userId: result.insertedId,
        ...contact,
        createdAt: new Date(),
      })),
    )

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
