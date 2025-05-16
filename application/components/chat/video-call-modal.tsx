"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface Contact {
  _id: string
  name: string
  avatar?: string
  status: string
  lastSeen: Date
}

interface VideoCallModalProps {
  contact: Contact
  onClose: () => void
}

export default function VideoCallModal({ contact, onClose }: VideoCallModalProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">("connecting")

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // WebRTC state
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    let pc: RTCPeerConnection | null = null
    let stream: MediaStream | null = null

    const setupMediaDevices = async () => {
      try {
        // Request access to user's camera and microphone
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        setLocalStream(stream)

        // Display local video stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Create RTCPeerConnection
        pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
        })

        setPeerConnection(pc)

        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          pc?.addTrack(track, stream!)
        })

        // Set up event handlers for peer connection
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            // In a real app, you would send this to the other peer via your signaling server
            console.log("New ICE candidate:", event.candidate)
          }
        }

        pc.ontrack = (event) => {
          // When we receive a remote stream
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0]
            setCallStatus("connected")
          }
        }

        // Simulate connection delay
        setTimeout(() => {
          // In a real app, this would be handled by the signaling server
          // For demo purposes, we're just simulating a connection
          setCallStatus("connected")

          // Create a fake remote stream if we don't have a real one
          if (!remoteVideoRef.current?.srcObject) {
            const canvas = document.createElement("canvas")
            canvas.width = 640
            canvas.height = 480
            const ctx = canvas.getContext("2d")
            if (ctx) {
              ctx.fillStyle = "#7c2d12"
              ctx.fillRect(0, 0, canvas.width, canvas.height)

              // Add text
              ctx.fillStyle = "white"
              ctx.font = "24px Arial"
              ctx.textAlign = "center"
              ctx.fillText(`${contact.name}'s Video`, canvas.width / 2, canvas.height / 2)

              // Convert canvas to MediaStream
              const fakeStream = canvas.captureStream(30)
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = fakeStream
              }
            }
          }
        }, 2000)
      } catch (error) {
        console.error("Error accessing media devices:", error)
      }
    }

    setupMediaDevices()

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      if (pc) {
        pc.close()
      }
    }
  }, [contact.name])

  const toggleMute = () => {
    if (!localStream) return

    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled
    })

    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    if (!localStream) return

    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled
    })

    setIsVideoOff(!isVideoOff)
  }

  const endCall = () => {
    setCallStatus("ended")

    // Close peer connection
    if (peerConnection) {
      peerConnection.close()
    }

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }

    setTimeout(onClose, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    >
      <div className="relative w-full max-w-4xl p-4">
        {/* Main video (remote) */}
        <div className="relative rounded-lg overflow-hidden bg-amber-950 aspect-video">
          {callStatus === "connecting" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                {contact.avatar ? (
                  <img
                    src={contact.avatar || "/placeholder.svg"}
                    alt={contact.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-amber-600 text-white text-lg font-semibold">
                    {contact.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-amber-100">{contact.name}</h3>
              <p className="text-amber-300">Connecting...</p>
              <div className="mt-4 flex space-x-2">
                <motion.div
                  className="w-3 h-3 bg-amber-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                />
                <motion.div
                  className="w-3 h-3 bg-amber-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                />
                <motion.div
                  className="w-3 h-3 bg-amber-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                />
              </div>
            </div>
          ) : (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          )}

          {/* Local video (picture-in-picture) */}
          <div className="absolute bottom-4 right-4 w-1/4 aspect-video rounded-lg overflow-hidden border-2 border-amber-600 shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isVideoOff ? "hidden" : ""}`}
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-amber-900 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-amber-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Call controls */}
        <div className="flex items-center justify-center mt-4 space-x-4">
          <button
            className={`p-4 rounded-full ${isMuted ? "bg-amber-700 text-white" : "bg-amber-800/50 text-amber-200"}`}
            onClick={toggleMute}
          >
            {isMuted ? (
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            ) : (
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
            )}
          </button>

          <button className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white" onClick={endCall}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
              />
            </svg>
          </button>

          <button
            className={`p-4 rounded-full ${isVideoOff ? "bg-amber-700 text-white" : "bg-amber-800/50 text-amber-200"}`}
            onClick={toggleVideo}
          >
            {isVideoOff ? (
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            ) : (
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
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
