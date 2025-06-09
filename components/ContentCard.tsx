"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import type { Message } from "@/lib/types"

interface ContentCardProps {
  item: Message
}

export default function ContentCard({ item }: ContentCardProps) {
  const [copied, setCopied] = useState(false)

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const generateUserColor = (userId: string) => {
    const colors = [
      "bg-orange-100 text-orange-800",
      "bg-amber-100 text-amber-800",
      "bg-yellow-100 text-yellow-800",
      "bg-red-100 text-red-800",
      "bg-pink-100 text-pink-800",
      "bg-purple-100 text-purple-800",
      "bg-indigo-100 text-indigo-800",
    ]
    const hash = userId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(item.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const downloadFile = () => {
    const link = document.createElement("a")
    link.href = item.content
    link.download = item.fileName || `file-${item.id.slice(0, 6)}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = () => {
    if (item.type === "pdf") {
      return (
        <svg className="w-12 h-12 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.819 14.427c.064.267.077.679-.021.948-.128.351-.381.528-.754.528h-.637v-2.12h.496c.474 0 .803.173.916.644zm3.091-8.65c2.047-.479 4.805.279 6.09 1.179-1.494-1.997-5.23-5.708-7.432-6.882 1.157 1.168 1.563 4.235 1.342 5.703zm-7.457 7.955h-.546v.943h.546c.235 0 .467-.027.576-.227.067-.123.067-.366 0-.489-.109-.198-.341-.227-.576-.227zm13.547-2.732v13h-20v-24h8.409c4.858 0 3.334 8 3.334 8 3.011-.745 8.257-.42 8.257 3zm-12.108 2.761c-.16-.484-.606-.761-1.224-.761h-1.668v3.686h.907v-1.277h.761c.619 0 1.064-.277 1.224-.763.094-.292.094-.597 0-.885zm3.407-.303c-.297-.299-.711-.458-1.199-.458h-1.599v3.686h1.599c.537 0 .961-.181 1.262-.535.554-.659.586-2.035-.063-2.693zm3.701-.458h-2.628v3.686h.907v-1.472h1.49v-.732h-1.49v-.698h1.721v-.784z" />
        </svg>
      )
    } else if (item.type === "file") {
      return (
        <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.602 4.075c2.201 1.174 4.904 4.885 6.398 6.882-1.286-.9-4.044-1.657-6.09-1.18.222-1.468-.186-4.534-1.343-5.702.576.394 1.039.777 1.035 0zm-.349 7.925c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5zm7.259-5.484c-.896-.828-2.299-2.02-3.25-2.86-1.853-1.634-1.102-3.656-1.102-3.656s-4.366 2.094-1.35 5.16c1.048 1.058 2.299 2.436 3.224 3.343-.327-2.294.562-3.146 2.478-1.987zm-11.012 11.484c0 .276-.224.5-.5.5h-8c-.276 0-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5h8c.276 0 .5.224.5.5v2zm0-6c0 .276-.224.5-.5.5h-8c-.276 0-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5h8c.276 0 .5.224.5.5v2zm-8.5-5.5h8c.276 0 .5.224.5.5v2c0 .276-.224.5-.5.5h-8c-.276 0-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5zm17.5 13.5h-20v-24h8.409c4.857 0 3.335 8 3.335 8 3.009-.745 8.256-.419 8.256 3v13z" />
        </svg>
      )
    }
    return null
  }

  const getCardClasses = () => {
    const baseClasses = "bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-orange-100 flex flex-col"

    if (item.type === "text") {
      const textLength = item.content.length
      if (textLength < 50) {
        return `${baseClasses} w-full max-w-xs`
      } else if (textLength < 150) {
        return `${baseClasses} w-full max-w-sm`
      } else {
        return `${baseClasses} w-full max-w-md`
      }
    } else if (item.type === "image") {
      return `${baseClasses} w-full max-w-sm`
    } else {
      return `${baseClasses} w-full max-w-xs`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={getCardClasses()}
    >
      <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${generateUserColor(item.userId)}`}>
            User {item.userId.slice(0, 6)}
          </span>
          <span className="text-xs text-gray-600">{formatTime(item.createdAt)}</span>
        </div>

        {item.type === "text" && (
          <button
            onClick={copyToClipboard}
            className="text-gray-600 hover:text-orange-600 transition-colors"
            title="Copy text"
          >
            {copied ? (
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        )}

        {(item.type === "image" || item.type === "pdf" || item.type === "file") && (
          <button
            onClick={downloadFile}
            className="text-gray-600 hover:text-amber-600 transition-colors"
            title="Download file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4 flex-1">
        {item.type === "text" && (
          <p className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed">{item.content}</p>
        )}

        {item.type === "image" && (
          <div className="flex justify-center">
            <Image
              src={item.content || "/placeholder.svg"}
              alt="Shared image"
              width={400}
              height={300}
              className="rounded-lg max-w-full h-auto object-contain border border-orange-100"
              unoptimized
            />
          </div>
        )}

        {(item.type === "pdf" || item.type === "file") && (
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            {getFileIcon()}
            <div className="text-center">
              <p className="font-medium text-gray-800 text-sm break-words">
                {item.fileName || `File-${item.id.slice(0, 6)}`}
              </p>
              {item.fileSize && <p className="text-xs text-gray-600">{(item.fileSize / 1024).toFixed(1)} KB</p>}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}