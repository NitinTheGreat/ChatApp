"use client"

import { useEffect } from "react"

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && window.workbox !== undefined) {
      const wb = window.workbox

      // Add event listeners to handle updates
      wb.addEventListener("installed", (event) => {
        console.log(`Service Worker installed: ${event.type}`)
      })

      wb.addEventListener("controlling", (event) => {
        console.log(`Service Worker controlling: ${event.type}`)
      })

      wb.addEventListener("activated", (event) => {
        console.log(`Service Worker activated: ${event.type}`)
      })

      // Register the service worker
      wb.register()
    }
  }, [])

  return null
}
