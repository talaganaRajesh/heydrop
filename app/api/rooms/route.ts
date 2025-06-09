import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { generateRoomId } from "@/lib/utils"
import type { Room } from "@/lib/types"

export async function POST() {
  try {
    console.log("🚀 Creating new room...")

    const roomId = generateRoomId()
    console.log(`📝 Generated room ID: ${roomId}`)

    const room: Room = {
      id: roomId,
      createdAt: Date.now(),
    }

    console.log("💾 Storing room...")
    await storage.setRoom(roomId, room)

    // Verify the room was stored with a small delay
    console.log("🔍 Verifying room storage...")
    await new Promise((resolve) => setTimeout(resolve, 100))

    const storedRoom = await storage.getRoom(roomId)

    if (!storedRoom) {
      console.error("❌ Room verification failed - room not found after storage")

      // Try to clear any corrupted data and retry with memory storage
      await storage.clearCorruptedData()

      // Force memory storage for this room
      const memoryStore = await import("@/lib/memory-store")
      memoryStore.memoryStore.setRoom(roomId, room)

      console.log("✅ Room stored in memory as fallback")
    }

    console.log(`✅ Room ${roomId} created successfully`)
    return NextResponse.json({ roomId })
  } catch (error) {
    console.error("❌ Failed to create room:", error)
    return NextResponse.json({ error: "Failed to create room. Please try again." }, { status: 500 })
  }
}

export async function GET() {
  try {
    const rooms = await storage.getAllRooms()
    return NextResponse.json({
      message: "Rooms API is working",
      storageType: storage.getStorageType(),
      activeRooms: rooms.length,
      rooms: rooms,
    })
  } catch (error) {
    console.error("❌ Failed to get rooms:", error)
    return NextResponse.json({ error: "Failed to get rooms" }, { status: 500 })
  }
}
