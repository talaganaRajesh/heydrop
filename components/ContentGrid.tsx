"use client"

import ContentCard from "./ContentCard"
import type { Message } from "@/lib/types"

interface ContentGridProps {
  items: Message[]
  loading?: boolean
}

export default function ContentGrid({ items, loading = false }: ContentGridProps) {
  const validItems = Array.isArray(items)
    ? items.filter((item) => {
        return (
          item &&
          typeof item === "object" &&
          item.id &&
          item.userId &&
          item.content &&
          item.type &&
          typeof item.createdAt === "number"
        )
      })
    : []

  if (validItems.length === 0 && !loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center bg-gradient-to-br ">
        <div className="text-center text-gray-600 max-w-md">
          <svg className="w-16 h-16 mx-auto mb-4 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No content yet</h3>
          <p className="text-gray-600">
            Share text, images, or files by using the form below. All content will be visible to anyone with the room link.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br ">
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {validItems.map((item) => (
          <div key={item.id} className="break-inside-avoid mb-4">
            <ContentCard item={item} />
          </div>
        ))}
      </div>

      {loading && validItems.length === 0 && (
        <div className="flex justify-center p-6">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}