"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import FileUpload from "./FileUpload"

interface ContentInputProps {
  onSubmit: (
    content: string,
    type: "text" | "image" | "pdf" | "file",
    fileName?: string,
    fileSize?: number,
    fileType?: string,
  ) => void
}

export default function ContentInput({ onSubmit }: ContentInputProps) {
  const [text, setText] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onSubmit(text.trim(), "text")
      setText("")
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
    }
  }

  const handleFileUpload = async (file: File) => {
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
        let fileType: "image" | "pdf" | "file" = "file"
        if (file.type.startsWith("image/")) {
          fileType = "image"
        } else if (file.type === "application/pdf") {
          fileType = "pdf"
        }
        onSubmit(url, fileType, file.name, file.size, file.type)
        setShowFileUpload(false)
      } else {
        console.error("Failed to upload file:", await response.text())
      }
    } catch (error) {
      console.error("Failed to upload file:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitText(e)
    }
  }

  return (
    <div className="space-y-4 bg-gradient-to-br from-orange-50 via-amber-50 to-white p-4 rounded-xl">
      {showFileUpload ? (
        <div className="space-y-4">
          <FileUpload onUpload={handleFileUpload} disabled={isUploading} />
          {isUploading && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading file...</span>
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={() => setShowFileUpload(false)}
              className="text-gray-600 hover:text-orange-600 text-sm font-medium transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitText} className="space-y-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-800"
              rows={3}
            />
          </div>
          <div className="flex justify-between items-center">
            <motion.button
              type="button"
              onClick={() => setShowFileUpload(true)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center bg-yellow-300 rounded-sm p-2 space-x-2 text-gray-600 hover:text-black transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <span className="font-medium">Upload File</span>
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!text.trim()}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              Save
            </motion.button>
          </div>
        </form>
      )}
    </div>
  )
}