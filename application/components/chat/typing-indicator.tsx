"use client"

import { motion } from "framer-motion"

interface TypingIndicatorProps {
  name: string
}

export default function TypingIndicator({ name }: TypingIndicatorProps) {
  return (
    <div className="flex justify-start">
      <div className="bg-amber-800/50 text-amber-100 rounded-2xl rounded-bl-none px-4 py-2">
        <p className="text-xs font-medium text-amber-300 mb-1">{name}</p>
        <div className="flex items-center">
          <motion.span
            className="inline-block w-2 h-2 bg-amber-400 rounded-full mr-1"
            animate={{ scale: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.span
            className="inline-block w-2 h-2 bg-amber-400 rounded-full mr-1"
            animate={{ scale: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
          />
          <motion.span
            className="inline-block w-2 h-2 bg-amber-400 rounded-full"
            animate={{ scale: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
          />
        </div>
      </div>
    </div>
  )
}
