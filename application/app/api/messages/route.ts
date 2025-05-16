import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(req: Request) {
  try {
    // Get user from auth token
    const user = await verifyAuth()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get contact ID from query params
    const url = new URL(req.url)
    const contactId = url.searchParams.get("contactId")

    if (!contactId) {
      return NextResponse.json({ message: "Missing contactId parameter" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Get contact
    const contact = await db.collection("contacts").findOne({
      _id: new ObjectId(contactId),
      userId: user._id,
    })

    if (!contact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 })
    }

    // Get messages
    const messages = await db
      .collection("messages")
      .find({
        $or: [
          { senderId: user._id.toString(), receiverId: contactId },
          { senderId: contactId, receiverId: user._id.toString() },
        ],
      })
      .sort({ timestamp: 1 })
      .toArray()

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Get messages error:", error)
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

    const { content, receiverId } = await req.json()

    // Validate input
    if (!content || !receiverId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if contact exists
    const contact = await db.collection("contacts").findOne({
      _id: new ObjectId(receiverId),
      userId: user._id,
    })

    if (!contact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 })
    }

    // Create message
    const message = {
      senderId: user._id.toString(),
      receiverId,
      content,
      timestamp: new Date(),
      read: false,
    }

    const result = await db.collection("messages").insertOne(message)

    // Update contact's last message
    await db.collection("contacts").updateOne(
      { _id: new ObjectId(receiverId) },
      {
        $set: {
          lastMessage: {
            content,
            timestamp: new Date(),
          },
        },
      },
    )

    // Get created message
    const createdMessage = await db.collection("messages").findOne({
      _id: result.insertedId,
    })

    // Emit message to socket (handled by socket server)

    return NextResponse.json(createdMessage)
  } catch (error) {
    console.error("Create message error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
