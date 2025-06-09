import type { Room, Message } from "@/lib/types"
import { memoryStore } from "./memory-store"

class StorageManager {
  private redis: any = null
  private useRedis = false
  private initialized = false

  private async initialize() {
    if (this.initialized) return

    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const { Redis } = await import("@upstash/redis")
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })

        // Test the connection
        await this.redis.ping()
        this.useRedis = true
        console.log("✅ Using Redis for storage")
      } else {
        console.log("⚠️ Redis not configured, using memory store")
      }
    } catch (error) {
      console.log("❌ Redis connection failed, using memory store:", error)
      this.useRedis = false
    }

    this.initialized = true
  }

  private safeJsonParse(data: any): any {
    try {
      // If it's already an object, return it
      if (typeof data === "object" && data !== null) {
        return data
      }

      // If it's a string, try to parse it
      if (typeof data === "string") {
        return JSON.parse(data)
      }

      // If it's something else, return null
      console.error("❌ Unexpected data type:", typeof data, data)
      return null
    } catch (error) {
      console.error("❌ JSON parse error:", error, "Data:", data)
      return null
    }
  }

  private safeJsonStringify(data: any): string {
    try {
      return JSON.stringify(data)
    } catch (error) {
      console.error("❌ JSON stringify error:", error)
      throw error
    }
  }

  async setRoom(roomId: string, room: Room): Promise<void> {
    await this.initialize()

    if (this.useRedis && this.redis) {
      try {
        const jsonString = this.safeJsonStringify(room)
        await this.redis.setex(`room:${roomId}`, 24 * 60 * 60, jsonString)
        console.log(`✅ Room ${roomId} stored in Redis`)
        return
      } catch (error) {
        console.error("❌ Redis setRoom error:", error)
        // Fall back to memory store
        this.useRedis = false
      }
    }

    memoryStore.setRoom(roomId, room)
    console.log(`✅ Room ${roomId} stored in memory`)
  }

  async getRoom(roomId: string): Promise<Room | null> {
    await this.initialize()

    if (this.useRedis && this.redis) {
      try {
        const data = await this.redis.get(`room:${roomId}`)
        console.log(`🔍 Redis raw data for room ${roomId}:`, typeof data, data)

        if (data) {
          const parsed = this.safeJsonParse(data)
          if (parsed) {
            console.log(`✅ Room ${roomId} found in Redis`)
            return parsed as Room
          } else {
            console.error(`❌ Failed to parse room data for ${roomId}`)
            // Try to delete corrupted data
            await this.redis.del(`room:${roomId}`)
          }
        }
      } catch (error) {
        console.error("❌ Redis getRoom error:", error)
        // Fall back to memory store
        this.useRedis = false
      }
    }

    const room = memoryStore.getRoom(roomId)
    if (room) {
      console.log(`✅ Room ${roomId} found in memory`)
    } else {
      console.log(`❌ Room ${roomId} not found`)
    }
    return room
  }

  async roomExists(roomId: string): Promise<boolean> {
    await this.initialize()

    if (this.useRedis && this.redis) {
      try {
        const exists = await this.redis.exists(`room:${roomId}`)
        console.log(`Room ${roomId} exists in Redis: ${exists}`)
        return exists > 0
      } catch (error) {
        console.error("❌ Redis roomExists error:", error)
        // Fall back to memory store
        this.useRedis = false
      }
    }

    const exists = memoryStore.roomExists(roomId)
    console.log(`Room ${roomId} exists in memory: ${exists}`)
    return exists
  }

  async addMessage(roomId: string, message: Message): Promise<void> {
    await this.initialize()

    if (this.useRedis && this.redis) {
      try {
        const jsonString = this.safeJsonStringify(message)
        await this.redis.setex(`message:${roomId}:${message.id}`, 24 * 60 * 60, jsonString)
        console.log(`✅ Message ${message.id} stored in Redis`)
        return
      } catch (error) {
        console.error("❌ Redis addMessage error:", error)
        // Fall back to memory store
        this.useRedis = false
      }
    }

    memoryStore.addMessage(roomId, message)
    console.log(`✅ Message ${message.id} stored in memory`)
  }

  async getMessages(roomId: string): Promise<Message[]> {
    await this.initialize()

    if (this.useRedis && this.redis) {
      try {
        const keys = await this.redis.keys(`message:${roomId}:*`)
        if (keys.length === 0) return []

        const messages = await this.redis.mget(...keys)
        const result: Message[] = []

        for (const data of messages) {
          if (data) {
            const parsed = this.safeJsonParse(data)
            if (parsed) {
              result.push(parsed as Message)
            }
          }
        }

        result.sort((a: Message, b: Message) => a.createdAt - b.createdAt)
        console.log(`✅ Found ${result.length} messages in Redis`)
        return result
      } catch (error) {
        console.error("❌ Redis getMessages error:", error)
        // Fall back to memory store
        this.useRedis = false
      }
    }

    const messages = memoryStore.getMessages(roomId)
    console.log(`✅ Found ${messages.length} messages in memory`)
    return messages
  }

  async getAllRooms(): Promise<string[]> {
    await this.initialize()

    if (this.useRedis && this.redis) {
      try {
        const keys = await this.redis.keys("room:*")
        return keys.map((key: string) => key.replace("room:", ""))
      } catch (error) {
        console.error("❌ Redis getAllRooms error:", error)
        // Fall back to memory store
        this.useRedis = false
      }
    }

    return memoryStore.getAllRooms()
  }

  async clearCorruptedData(): Promise<void> {
    if (this.useRedis && this.redis) {
      try {
        // Get all room keys
        const roomKeys = await this.redis.keys("room:*")

        for (const key of roomKeys) {
          try {
            const data = await this.redis.get(key)
            this.safeJsonParse(data) // This will log errors for corrupted data
          } catch (error) {
            console.log(`🧹 Deleting corrupted room key: ${key}`)
            await this.redis.del(key)
          }
        }
      } catch (error) {
        console.error("❌ Error clearing corrupted data:", error)
      }
    }
  }

  getStorageType(): string {
    return this.useRedis ? "Redis" : "Memory"
  }
}

export const storage = new StorageManager()
