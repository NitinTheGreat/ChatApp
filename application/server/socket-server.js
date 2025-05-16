const http = require("http")
const { Server } = require("socket.io")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

// Load models
require("../models/user")
require("../models/contact")
require("../models/message")

const User = mongoose.model("User")
const Contact = mongoose.model("Contact")
const Message = mongoose.model("Message")

// Create HTTP server
const server = http.createServer()

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })

// Middleware to authenticate socket connections
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error("Authentication error"))
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret")

    if (!decoded || !decoded.userId) {
      return next(new Error("Authentication error"))
    }

    // Find user
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return next(new Error("User not found"))
    }

    // Attach user to socket
    socket.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    }

    next()
  } catch (error) {
    console.error("Socket authentication error:", error)
    next(new Error("Authentication error"))
  }
})

// Handle socket connections
io.on("connection", async (socket) => {
  console.log(`User connected: ${socket.user._id}`)

  // Update user status to online
  await User.findByIdAndUpdate(socket.user._id, { status: "online", lastSeen: new Date() })

  // Broadcast user status change to all clients
  io.emit("user_status_change", {
    userId: socket.user._id,
    status: "online",
    lastSeen: new Date(),
  })

  // Join user's room
  socket.join(socket.user._id)

  // Handle typing event
  socket.on("typing", (data) => {
    const { receiverId } = data

    // Emit typing event to receiver
    socket.to(receiverId).emit("typing", {
      senderId: socket.user._id,
    })
  })

  // Handle new message
  socket.on("new_message", async (data) => {
    const { receiverId, content } = data

    // Create message in database
    const message = new Message({
      senderId: socket.user._id,
      receiverId,
      content,
      timestamp: new Date(),
      read: false,
    })

    await message.save()

    // Update contact's last message
    await Contact.findOneAndUpdate(
      { _id: receiverId, userId: socket.user._id },
      {
        lastMessage: {
          content,
          timestamp: new Date(),
        },
      }
    )

    // Emit message to sender and receiver
    io.to(socket.user._id).emit("new_message", message)
    io.to(receiverId).emit("new_message", message)
  })

  // Handle call request
  socket.on("call_request", (data) => {
    const { receiverId, type } = data

    // Emit call request to receiver
    socket.to(receiverId).emit("call_request", {
      senderId: socket.user._id,
      senderName: socket.user.name,
      type,
    })
  })

  // Handle call response
  socket.on("call_response", (data) => {
    const { receiverId, accepted } = data

    // Emit call response to receiver
    socket.to(receiverId).emit("call_response", {
      senderId: socket.user._id,
      accepted,
    })
  })

  // Handle WebRTC signaling
  socket.on("webrtc_signal", (data) => {
    const { receiverId, signal } = data

    // Emit signal to receiver
    socket.to(receiverId).emit("webrtc_signal", {
      senderId: socket.user._id,
      signal,
    })
  })

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.user._id}`)

    // Update user status to offline
    await User.findByIdAndUpdate(socket.user._id, { status: "offline", lastSeen: new Date() })

    // Broadcast user status change to all clients
    io.emit("user_status_change", {
      userId: socket.user._id,
      status: "offline",
      lastSeen: new Date(),
    })

    // Leave user's room
    socket.leave(socket.user._id)
  })
})
