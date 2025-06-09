import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function generateRoomId(): string {
  // Get current time in seconds
  const timeInSeconds = Math.floor(Date.now() / 1000)

  // Convert to base36 for shorter representation
  const timeBase36 = timeInSeconds.toString(36)

  // Add 2 random characters for uniqueness
  const randomChars = Math.random().toString(36).substring(2, 4)

  // Take last 3-4 characters of time + 2 random = 5-6 chars total
  const shortTimeId = timeBase36.slice(-3) + randomChars

  return shortTimeId.toLowerCase()
}

export function generateUserId(): string {
  return Math.random().toString(36).substring(2, 8)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
