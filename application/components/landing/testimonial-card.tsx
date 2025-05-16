"use client"

import { motion } from "framer-motion"

interface TestimonialCardProps {
  name: string
  role: string
  company: string
  content: string
  avatar: string
  index: number
  inView: boolean
}

export default function TestimonialCard({ name, role, company, content, avatar, index, inView }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="p-6 rounded-xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 backdrop-blur-sm"
    >
      <div className="mb-4">
        <svg className="w-8 h-8 text-indigo-400" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
      </div>
      <p className="mb-6 text-indigo-200">{content}</p>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          <img className="w-10 h-10 rounded-full object-cover" src={avatar || "/placeholder.svg"} alt={name} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-indigo-300">
            {role}, {company}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
