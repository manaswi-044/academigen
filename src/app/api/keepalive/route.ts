import { NextResponse } from 'next/server'

/**
 * Keep-alive route for Render.com free tier.
 * Render spins down after 15 minutes of inactivity.
 * This endpoint is pinged by Vercel cron every 10 minutes.
 */
export async function GET() {
  const renderUrl = process.env.RENDER_FASTAPI_URL

  if (!renderUrl || renderUrl === 'YOUR_KEY_HERE') {
    return NextResponse.json({
      ok: true,
      note: 'RENDER_FASTAPI_URL not configured yet. Skipping ping.'
    })
  }

  try {
    const start = Date.now()
    const res = await fetch(`${renderUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(8000) // 8s timeout
    })
    const latency = Date.now() - start

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      latency_ms: latency,
      timestamp: new Date().toISOString()
    })
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err.message,
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
