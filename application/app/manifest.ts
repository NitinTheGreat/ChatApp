import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Conclave - Modern Chat & Video Calls",
    short_name: "Conclave",
    description: "Connect, collaborate, and communicate with crystal clarity",
    start_url: "/",
    display: "standalone",
    background_color: "#7c2d12",
    theme_color: "#7c2d12",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
