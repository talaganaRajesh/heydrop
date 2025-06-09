import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function POST() {
  try {
    console.log("🧹 Starting cleanup of corrupted data...")
    await storage.clearCorruptedData()
    console.log("✅ Cleanup completed")

    return NextResponse.json({
      message: "Cleanup completed successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Cleanup failed:", error)
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to trigger cleanup",
    endpoint: "/api/cleanup",
  })
}
