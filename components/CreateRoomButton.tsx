"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function CreateRoomButton() {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const createRoom = async () => {
    setIsCreating(true)
    setError(null)

    try {
      console.log("🚀 Creating room...")
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      console.log("📡 Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Room created:", data.roomId)

        // Add a small delay before navigation to ensure the room is fully stored
        await new Promise((resolve) => setTimeout(resolve, 200))

        router.push(`/${data.roomId}`)
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("❌ Failed to create room:", errorData)
        setError(errorData.error || "Failed to create room")
      }
    } catch (error) {
      console.error("❌ Network error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleCleanup = async () => {
    try {
      console.log("🧹 Triggering cleanup...")
      await fetch("/api/cleanup", { method: "POST" })
      console.log("✅ Cleanup completed")
      setError(null)
    } catch (error) {
      console.error("❌ Cleanup failed:", error)
    }
  }

  return (
    <div className="space-y-4">
      <motion.button
        onClick={createRoom}
        disabled={isCreating}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      >
        <span className="relative z-10">
          {isCreating ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Room...</span>
            </div>
          ) : (
            "Create Room"
          )}
        </span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered && !isCreating ? '100%' : '-100%' }}
          transition={{ duration: 0.6 }}
        />
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm space-y-2"
        >
          <p>{error}</p>
          <button
            onClick={handleCleanup}
            className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
          >
            Try Cleanup & Retry
          </button>
        </motion.div>
      )}
    </div>
  )
}