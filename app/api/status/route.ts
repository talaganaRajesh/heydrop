import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET() {
  try {
    const rooms = await storage.getAllRooms()

    return NextResponse.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      storageType: storage.getStorageType(),
      activeRooms: rooms.length,
      roomsList: rooms,
      environment: process.env.NODE_ENV,
      hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
      hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  } catch (error) {
    console.error("❌ Status endpoint error:", error)
    return NextResponse.json(
      {
        status: "ERROR",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
