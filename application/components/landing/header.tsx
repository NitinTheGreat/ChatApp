"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-3 bg-indigo-950/80 backdrop-blur-lg shadow-lg" : "py-5 bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between px-4 mx-auto">
        <Link href="/" className="flex items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Conclave
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden space-x-8 md:flex"
        >
          <Link href="/#features" className="text-indigo-200 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/#testimonials" className="text-indigo-200 hover:text-white transition-colors">
            Testimonials
          </Link>
          <Link href="/#pricing" className="text-indigo-200 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-indigo-200 hover:text-white transition-colors">
            About
          </Link>
        </motion.nav>

        {/* Auth Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden space-x-4 md:flex"
        >
          <Link href="/auth/login">
            <button className="px-4 py-2 text-sm font-medium transition-all rounded-lg text-indigo-200 hover:text-white">
              Sign In
            </button>
          </Link>
          <Link href="/auth/signup">
            <button className="px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500">
              Sign Up
            </button>
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="p-2 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-indigo-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-indigo-950/90 backdrop-blur-lg"
          >
            <div className="container px-4 py-4 mx-auto">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/#features"
                  className="py-2 text-indigo-200 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/#testimonials"
                  className="py-2 text-indigo-200 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Testimonials
                </Link>
                <Link
                  href="/#pricing"
                  className="py-2 text-indigo-200 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/about"
                  className="py-2 text-indigo-200 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <div className="flex flex-col space-y-2 pt-2 border-t border-indigo-800">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2 text-sm font-medium text-center transition-all rounded-lg text-indigo-200 hover:text-white">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2 text-sm font-medium text-center text-white transition-all rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500">
                      Sign Up
                    </button>
                  </Link>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
