import { Redis } from "@upstash/redis"

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    console.log("Initializing Redis client...")

    // Use the correct Upstash environment variable names
    const url = process.env.KV_REST_API_URL
    const token = process.env.KV_REST_API_TOKEN

    if (!url || !token) {
      console.error("Missing Redis environment variables:")
      console.error("UPSTASH_REDIS_REST_URL:", url ? "✓ Set" : "✗ Missing")
      console.error("UPSTASH_REDIS_REST_TOKEN:", token ? "✓ Set" : "✗ Missing")

      throw new Error(
        "Missing Upstash Redis environment variables. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your Vercel environment variables.",
      )
    }

    try {
      redis = new Redis({
        url,
        token,
      })
      console.log("Redis client initialized successfully")
    } catch (error) {
      console.error("Failed to initialize Redis client:", error)
      throw error
    }
  }

  return redis
}

export const ROOM_TTL = 24 * 60 * 60 // 24 hours in seconds
export const MESSAGE_TTL = 24 * 60 * 60 // 24 hours in seconds
