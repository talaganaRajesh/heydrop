import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId

    // Test room existence
    const roomExists = await storage.roomExists(roomId)

    // Get room data
    const room = await storage.getRoom(roomId)

    // Get messages
    const messages = await storage.getMessages(roomId)

    return NextResponse.json({
      roomId,
      exists: roomExists,
      room,
      messages,
      messageCount: messages.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Test room error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
