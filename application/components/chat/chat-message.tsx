"use client"

import { motion } from "framer-motion"

interface Message {
  _id: string
  content: string
  timestamp: Date
  senderId: string
  receiverId: string
}

interface ChatMessageProps {
  message: Message
  isMine: boolean
  senderName: string
}

export default function ChatMessage({ message, isMine, senderName }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isMine
            ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-br-none"
            : "bg-amber-800/50 text-amber-100 rounded-bl-none"
        }`}
      >
        {!isMine && <p className="text-xs font-medium text-amber-300 mb-1">{senderName}</p>}
        <p className="text-sm">{message.content}</p>
        <p className="text-xs text-right mt-1 opacity-70">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  )
}
