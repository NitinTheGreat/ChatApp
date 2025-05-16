"use client"

import { motion } from "framer-motion"
import Lottie from "lottie-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: any
  index: number
  inView: boolean
}

export default function FeatureCard({ title, description, icon, index, inView }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="p-6 rounded-xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 backdrop-blur-sm"
    >
      <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="w-10 h-10">
          <Lottie animationData={icon} loop={true} />
        </div>
      </div>
      <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
      <p className="text-indigo-200">{description}</p>
    </motion.div>
  )
}
