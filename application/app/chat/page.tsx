"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import ChatSidebar from "@/components/chat/chat-sidebar"
import ChatMessage from "@/components/chat/chat-message"
import TypingIndicator from "@/components/chat/typing-indicator"
import VideoCallModal from "@/components/chat/video-call-modal"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useSocket } from "@/context/socket-context"
import { useAuth } from "@/context/auth-context"

export default function ChatPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { socket, isConnected } = useSocket()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [contacts, setContacts] = useState<any[]>([])
  const [activeContact, setActiveContact] = useState<any>(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [authLoading, user, router])

  // Set sidebar state based on screen size
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  // Fetch contacts
  useEffect(() => {
    if (!user) return

    const fetchContacts = async () => {
      try {
        const response = await fetch("/api/contacts")
        if (!response.ok) throw new Error("Failed to fetch contacts")

        const data = await response.json()
        setContacts(data)

        // Set first contact as active if none is selected
        if (data.length > 0 && !activeContact) {
          setActiveContact(data[0])
        }
      } catch (error) {
        console.error("Error fetching contacts:", error)
      }
    }

    fetchContacts()
  }, [user, activeContact])

  // Fetch messages when active contact changes
  useEffect(() => {
    if (!user || !activeContact) return

    const fetchMessages = async () => {
      setIsLoadingMessages(true)
      try {
        const response = await fetch(`/api/messages?contactId=${activeContact._id}`)
        if (!response.ok) throw new Error("Failed to fetch messages")

        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    fetchMessages()
  }, [user, activeContact])

  // Socket.io event listeners
  useEffect(() => {
    if (!socket || !isConnected || !user) return

    // Listen for new messages
    socket.on("new_message", (message: any) => {
      if (
        (message.senderId === user._id && message.receiverId === activeContact?._id) ||
        (message.senderId === activeContact?._id && message.receiverId === user._id)
      ) {
        setMessages((prev) => [...prev, message])
      }
    })

    // Listen for typing events
    socket.on("typing", (data: any) => {
      if (data.senderId === activeContact?._id) {
        setIsTyping(true)

        // Clear previous timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout)
        }

        // Set new timeout to stop typing indicator after 3 seconds
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, 3000)

        setTypingTimeout(timeout)
      }
    })

    // Listen for online status changes
    socket.on("user_status_change", (data: any) => {
      setContacts((prev) =>
        prev.map((contact) =>
          contact._id === data.userId ? { ...contact, status: data.status, lastSeen: data.lastSeen } : contact,
        ),
      )
    })

    return () => {
      socket.off("new_message")
      socket.off("typing")
      socket.off("user_status_change")

      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [socket, isConnected, user, activeContact, typingTimeout])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !activeContact) return

    const messageData = {
      content: newMessage,
      receiverId: activeContact._id,
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      })

      if (!response.ok) throw new Error("Failed to send message")

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    // Emit typing event
    if (socket && isConnected && user && activeContact) {
      socket.emit("typing", {
        senderId: user._id,
        receiverId: activeContact._id,
      })
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const startVideoCall = () => {
    if (!activeContact) return
    setShowVideoCall(true)

    // Emit call request
    if (socket && isConnected && user) {
      socket.emit("call_request", {
        senderId: user._id,
        receiverId: activeContact._id,
        type: "video",
      })
    }
  }

  const startAudioCall = () => {
    if (!activeContact) return

    // Emit call request
    if (socket && isConnected && user) {
      socket.emit("call_request", {
        senderId: user._id,
        receiverId: activeContact._id,
        type: "audio",
      })
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-amber-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-amber-200">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-amber-950 to-amber-900 text-amber-100">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: isMobile ? -300 : 0, opacity: isMobile ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`${isMobile ? "absolute z-30 h-full" : "relative"} w-80 glass-effect border-r border-amber-800/30`}
          >
            <ChatSidebar
              contacts={contacts}
              activeContact={activeContact}
              setActiveContact={setActiveContact}
              onClose={() => isMobile && setSidebarOpen(false)}
              currentUser={user}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 h-full">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-800/30 glass-effect">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="p-2 mr-2 text-amber-200 rounded-full hover:bg-amber-800/30">
              {sidebarOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            {activeContact ? (
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-amber-700 mr-3 overflow-hidden">
                    {activeContact.avatar ? (
                      <img
                        src={activeContact.avatar || "/placeholder.svg"}
                        alt={activeContact.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-amber-600 text-white text-lg font-semibold">
                        {activeContact.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-amber-900 ${
                      activeContact.status === "online"
                        ? "bg-green-500"
                        : activeContact.status === "away"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                    }`}
                  />
                </div>
                <div>
                  <h2 className="font-semibold">{activeContact.name}</h2>
                  <p className="text-xs text-amber-300">
                    {activeContact.status === "online"
                      ? "Online"
                      : activeContact.status === "away"
                        ? "Away"
                        : `Last seen ${new Date(activeContact.lastSeen).toLocaleTimeString()}`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-amber-300">Select a contact to start chatting</div>
            )}
          </div>
          {activeContact && (
            <div className="flex">
              <button className="p-2 mr-2 text-amber-200 rounded-full hover:bg-amber-800/30" onClick={startAudioCall}>
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </button>
              <button className="p-2 text-amber-200 rounded-full hover:bg-amber-800/30" onClick={startVideoCall}>
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeContact ? (
            <>
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-t-2 border-amber-500 border-solid rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-amber-300">
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p>No messages yet</p>
                  <p className="mt-2 text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message._id}
                      message={message}
                      isMine={message.senderId === user._id}
                      senderName={message.senderId === user._id ? "You" : activeContact.name}
                    />
                  ))}
                  {isTyping && <TypingIndicator name={activeContact.name} />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-amber-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-24 h-24 mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <p className="text-xl">Welcome to Conclave</p>
              <p className="mt-2">Select a contact to start chatting</p>
            </div>
          )}
        </div>

        {/* Message Input */}
        {activeContact && (
          <div className="p-4 border-t border-amber-800/30 glass-effect">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <button type="button" className="p-2 text-amber-200 rounded-full hover:bg-amber-800/30">
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
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1"
              />
              <button
                type="submit"
                className="p-2 text-white rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400"
                disabled={!newMessage.trim()}
              >
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      {showVideoCall && activeContact && (
        <VideoCallModal contact={activeContact} onClose={() => setShowVideoCall(false)} />
      )}
    </div>
  )
}
