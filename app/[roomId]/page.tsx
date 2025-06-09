"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import RoomHeader from "@/components/RoomHeader"
import ContentGrid from "@/components/ContentGrid"
import ContentInput from "@/components/ContentInput"
import { useRoomStore } from "@/store/roomStore"
import type { Room } from "@/lib/types"

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contentLoading, setContentLoading] = useState(false)

  const { messages, setMessages, addMessage } = useRoomStore()

  useEffect(() => {
    let mounted = true

    const fetchRoom = async () => {
      if (!mounted) return

      try {
        console.log(`🔍 Fetching room: ${roomId}`)

        const response = await fetch(`/api/rooms/${roomId}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        console.log(`📡 Room fetch response status: ${response.status}`)

        if (!mounted) return

        if (response.ok) {
          const roomData = await response.json()
          console.log("✅ Room data received:", roomData)
          setRoom(roomData)
          setError(null)
        } else if (response.status === 404) {
          const errorData = await response.json().catch(() => ({ error: "Room not found" }))
          console.error("❌ Room not found:", errorData.error)
          setError(errorData.error || "Room not found or has expired")
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          console.error("❌ Failed to load room:", errorData)
          setError(errorData.error || "Failed to load room")
        }
      } catch (err) {
        console.error("❌ Error fetching room:", err)
        if (mounted) {
          setError("Network error. Please check your connection.")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // First fetch the room
    fetchRoom()

    return () => {
      mounted = false
    }
  }, [roomId])

  // Separate effect to start content polling when room becomes available
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    let mounted = true

    if (room) {
      console.log("🚀 Starting content polling for room:", room.id)

      const fetchContent = async () => {
        if (!mounted) return

        try {
          console.log(`📨 Polling content for room: ${roomId}`)
          setContentLoading(true)

          const response = await fetch(`/api/rooms/${roomId}/messages`, {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          })

          if (!mounted) return

          if (response.ok) {
            const contentData = await response.json()
            if (Array.isArray(contentData)) {
              setMessages(contentData)
              console.log(`🔄 Polled ${contentData.length} items`)
            }
          } else {
            console.log(`⚠️ Content polling failed with status: ${response.status}`)
          }
        } catch (err) {
          console.error("❌ Error during content polling:", err)
        } finally {
          if (mounted) {
            setContentLoading(false)
          }
        }
      }

      // Initial fetch
      fetchContent()

      // Set up polling
      interval = setInterval(fetchContent, 3000)
    }

    return () => {
      mounted = false
      if (interval) {
        console.log("🛑 Stopping content polling")
        clearInterval(interval)
      }
    }
  }, [room, roomId, setMessages])

  const handleSubmitContent = async (
    content: string,
    type: "text" | "image" | "pdf" | "file",
    fileName?: string,
    fileSize?: number,
    fileType?: string,
  ) => {
    try {
      console.log(`📤 Sending ${type} content to room ${roomId}`)
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          type,
          fileName,
          fileSize,
          fileType,
        }),
      })

      if (response.ok) {
        const newContent = await response.json()
        console.log("✅ Content shared successfully:", newContent.id)
        addMessage(newContent)
      } else {
        console.error("❌ Failed to share content:", response.status)
        const errorText = await response.text().catch(() => "Unknown error")
        console.error("❌ Share content error:", errorText)
      }
    } catch (err) {
      console.error("❌ Error sharing content:", err)
    }
  }

  const handleCreateNewRoom = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
          <p className="text-sm text-gray-500 mt-2">Room ID: {roomId.toUpperCase()}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Not Found</h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Room ID: {roomId.toUpperCase()}</p>
          <button
            onClick={handleCreateNewRoom}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Create New Room
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <RoomHeader room={room!} />

      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <ContentGrid items={messages} loading={contentLoading && messages.length === 0} />
        </div>

        <div className="border-t bg-white p-4">
          <ContentInput onSubmit={handleSubmitContent} />
        </div>
      </div>
    </div>
  )
}
