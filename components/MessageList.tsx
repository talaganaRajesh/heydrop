//MessageList.tsx


"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import type { Message } from "@/lib/types"

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const generateUserColor = (userId: string) => {
    const colors = [
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ]
    const hash = userId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  // Validate and filter messages
  const validMessages = Array.isArray(messages)
    ? messages.filter((message) => {
        return (
          message &&
          typeof message === "object" &&
          message.id &&
          message.userId &&
          message.content &&
          message.type &&
          typeof message.createdAt === "number"
        )
      })
    : []

  if (validMessages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Be the first to send a message!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-violet-700 overflow-y-auto p-4 space-y-4">
      <AnimatePresence>
        {validMessages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${generateUserColor(message.userId)}`}>
                User {message.userId.slice(0, 6)}
              </span>
              <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 max-w-2xl">
              {message.type === "text" ? (
                <p className="text-gray-900 whitespace-pre-wrap break-words">{message.content}</p>
              ) : (
                <div className="space-y-2">
                  <Image
                    src={message.content || "/placeholder.svg"}
                    alt="Shared image"
                    width={400} 
                    height={300}
                    className="rounded-lg max-w-full h-auto"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  )
}
