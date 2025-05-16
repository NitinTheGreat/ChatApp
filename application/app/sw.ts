export function register() {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        const swUrl = "/service-worker.js"
        navigator.serviceWorker
          .register(swUrl)
          .then((registration) => {
            console.log("ServiceWorker registration successful with scope: ", registration.scope)
          })
          .catch((error) => {
            console.log("ServiceWorker registration failed: ", error)
          })
      })
    }
  }
  
  export function unregister() {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.unregister()
      })
    }
  }
  