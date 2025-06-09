import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check all possible environment variable names
    const envVars = {
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      KV_REST_API_URL: process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    }

    console.log("Environment variables check:")
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`${key}: ${value ? "✓ Set" : "✗ Missing"}`)
    })

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      environmentVariables: Object.fromEntries(
        Object.entries(envVars).map(([key, value]) => [key, value ? "SET" : "MISSING"]),
      ),
      allEnvKeys: Object.keys(process.env).filter(
        (key) => key.includes("REDIS") || key.includes("KV") || key.includes("UPSTASH"),
      ),
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
