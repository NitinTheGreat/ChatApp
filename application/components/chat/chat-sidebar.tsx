"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { format } from "date-fns"

interface Contact {
  _id: string
  name: string
  avatar?: string
  status: string
  lastSeen: Date
  lastMessage?: {
    content: string
    timestamp: Date
  }
}

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
}

interface ChatSidebarProps {
  contacts: Contact[]
  activeContact: Contact | null
  setActiveContact: (contact: Contact) => void
  onClose: () => void
  currentUser: User
}

export default function ChatSidebar({
  contacts,
  activeContact,
  setActiveContact,
  onClose,
  currentUser,
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"chats" | "calls">("chats")

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-indigo-800/30">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
          Conclave
        </h1>
        <div className="flex items-center">
          <button className="p-2 mr-2 text-indigo-200 rounded-full hover:bg-indigo-800/30" title="Add Contact">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </button>
          <div className="relative group">
            <button className="p-2 text-indigo-200 rounded-full hover:bg-indigo-800/30" title="Settings">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <div className="absolute right-0 z-10 invisible w-48 mt-2 origin-top-right bg-indigo-900 border border-indigo-800/50 rounded-md shadow-lg opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300">
              <div className="py-1">
                <Link href="/profile" className="block px-4 py-2 text-sm text-indigo-200 hover:bg-indigo-800/50">
                  Profile
                </Link>
                <Link href="/settings" className="block px-4 py-2 text-sm text-indigo-200 hover:bg-indigo-800/50">
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-sm text-left text-indigo-200 hover:bg-indigo-800/50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          <button className="p-2 ml-2 text-indigo-200 rounded-full hover:bg-indigo-800/30 md:hidden" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute w-5 h-5 text-indigo-400 left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-1 px-4 mb-2">
          <button
            className={`py-2 text-center rounded-lg transition-colors ${
              activeTab === "chats" ? "bg-indigo-700/50 text-indigo-100" : "text-indigo-300 hover:bg-indigo-800/30"
            }`}
            onClick={() => setActiveTab("chats")}
          >
            Chats
          </button>
          <button
            className={`py-2 text-center rounded-lg transition-colors ${
              activeTab === "calls" ? "bg-indigo-700/50 text-indigo-100" : "text-indigo-300 hover:bg-indigo-800/30"
            }`}
            onClick={() => setActiveTab("calls")}
          >
            Calls
          </button>
        </div>

        {activeTab === "chats" ? (
          <div className="flex-1 overflow-y-auto p-2">
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-indigo-300">
                <p>No contacts found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredContacts.map((contact) => (
                  <motion.div
                    key={contact._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveContact(contact)}
                    className={`flex items-center p-3 rounded-lg cursor-pointer ${
                      activeContact?._id === contact._id ? "bg-indigo-800/50" : "hover:bg-indigo-800/30"
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {contact.avatar ? (
                          <img
                            src={contact.avatar || "/placeholder.svg"}
                            alt={contact.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-indigo-600 text-white text-lg font-semibold">
                            {contact.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-indigo-900 ${
                          contact.status === "online"
                            ? "bg-green-500"
                            : contact.status === "away"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                        }`}
                      />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h3 className="font-medium truncate">{contact.name}</h3>
                        <span className="text-xs text-indigo-400 whitespace-nowrap">
                          {contact.lastMessage?.timestamp
                            ? format(new Date(contact.lastMessage.timestamp), "h:mm a")
                            : format(new Date(contact.lastSeen), "h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-indigo-300 truncate">
                        {contact.lastMessage?.content || (contact.status === "online" ? "Online" : "Offline")}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-2">
            <div className="flex flex-col items-center justify-center h-full text-indigo-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <p>No recent calls</p>
            </div>
          </div>
        )}
      </div>

      {/* User profile at bottom */}
      <div className="p-4 border-t border-indigo-800/30">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar || "/placeholder.svg"}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-indigo-600 text-white text-lg font-semibold">
                {currentUser.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{currentUser.name}</h3>
            <p className="text-xs text-indigo-300 truncate">{currentUser.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
