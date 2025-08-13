import { NextResponse } from "next/server"
import { getAnalyticsData } from "@/lib/supabase-queries-adapted"

export async function GET() {
  try {
    const analyticsData = await getAnalyticsData()
    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
