import mongoose, { Schema, type Document } from "mongoose"

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  email: string
  avatar?: string
  status: "online" | "offline" | "away"
  lastSeen: Date
  lastMessage?: {
    content: string
    timestamp: Date
  }
  createdAt: Date
}

const ContactSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String },
  status: { type: String, enum: ["online", "offline", "away"], default: "offline" },
  lastSeen: { type: Date, default: Date.now },
  lastMessage: {
    content: { type: String },
    timestamp: { type: Date },
  },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema)
