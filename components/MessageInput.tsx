"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import ImageUpload from "./ImageUpload"

interface MessageInputProps {
  onSendMessage: (content: string, type?: "text" | "image") => void
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/uploadthing", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()
        onSendMessage(url, "image")
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-3 bg-gradient-to-br from-red-500 via-green-500 to-white p-4 rounded-xl">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-orange-100 rounded-full focus:outline-none text-gray-800 focus:border-orange-80"
          disabled={isUploading}
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!message.trim() || isUploading}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
        >
          Send
        </motion.button>
      </form>
      <div className="flex items-center justify-between">
        <ImageUpload onUpload={handleImageUpload} disabled={isUploading} />
        {isUploading && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Uploading image...</span>
          </div>
        )}
      </div>
    </div>
  )
}