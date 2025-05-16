"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useAnimation } from "framer-motion"
import AnimatedBackground from "@/components/animated-background"

export default function LandingPage() {
  const controls = useAnimation()
  const textRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    })

    // Animate text gradient
    const textElement = textRef.current
    if (textElement) {
      let position = 0
      const interval = setInterval(() => {
        position = (position + 1) % 200
        textElement.style.backgroundPosition = `${position}% 50%`
      }, 50)

      return () => clearInterval(interval)
    }
  }, [controls])

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-950 to-amber-900">
      <AnimatedBackground />
      <div className="container relative z-10 flex flex-col items-center justify-center min-h-screen px-4 mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={controls} className="max-w-3xl">
          <motion.h1
            ref={textRef}
            className="mb-6 text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 sm:text-7xl"
            style={{ backgroundSize: "200% 100%" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
          >
            Conclave
          </motion.h1>
          <motion.p
            className="mb-8 text-xl text-amber-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            Connect, collaborate, and communicate with crystal clarity. Experience real-time messaging and seamless
            audio/video calls.
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            <Link href="/auth/signup">
              <button className="px-6 py-3 text-lg font-medium text-white transition-all rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 hover:shadow-lg">
                Get Started
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="px-6 py-3 text-lg font-medium transition-all border rounded-lg text-amber-100 border-amber-600 hover:bg-amber-800/30 hover:shadow-lg">
                Sign In
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
