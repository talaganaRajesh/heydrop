import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "API is working",
    timestamp: new Date().toISOString(),
    env: {
      hasRedisUrl: !!process.env.KV_REST_API_URL,
      hasRedisToken: !!process.env.KV_REST_API_TOKEN,
      nodeEnv: process.env.NODE_ENV,
    },
  })
}
