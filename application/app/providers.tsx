"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/context/auth-context"
import { SocketProvider } from "@/context/socket-context"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>{children}</SocketProvider>
    </AuthProvider>
  )
}
