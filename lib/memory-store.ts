// Simple in-memory store as fallback when Redis is not available
interface Room {
  id: string
  createdAt: number
}

interface Message {
  id: string
  roomId: string
  userId: string
  content: string
  type: "text" | "image"
  createdAt: number
}

class MemoryStore {
  private rooms = new Map<string, Room>()
  private messages = new Map<string, Message[]>()

  // Clean up expired rooms (older than 24 hours)
  private cleanup() {
    const now = Date.now()
    const expireTime = 24 * 60 * 60 * 1000 // 24 hours

    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.createdAt > expireTime) {
        this.rooms.delete(roomId)
        this.messages.delete(roomId)
      }
    }
  }

  setRoom(roomId: string, room: Room) {
    this.cleanup()
    this.rooms.set(roomId, room)
  }

  getRoom(roomId: string): Room | null {
    this.cleanup()
    return this.rooms.get(roomId) || null
  }

  roomExists(roomId: string): boolean {
    this.cleanup()
    return this.rooms.has(roomId)
  }

  addMessage(roomId: string, message: Message) {
    this.cleanup()
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, [])
    }
    this.messages.get(roomId)!.push(message)
  }

  getMessages(roomId: string): Message[] {
    this.cleanup()
    return this.messages.get(roomId) || []
  }

  getAllRooms(): string[] {
    this.cleanup()
    return Array.from(this.rooms.keys())
  }
}

export const memoryStore = new MemoryStore()
