import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'otplib'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  const secret = process.env.ADMIN_TOTP_SECRET
  if (!secret) return NextResponse.json({ ok: false })
  
  const valid = verify({ token: code, secret })
  if (!valid) return NextResponse.json({ ok: false }, { status: 401 })
  
  // Return a session token valid for 1 hour
  const token = Buffer.from(`admin:${Date.now() + 3600000}`).toString('base64')
  return NextResponse.json({ ok: true, token })
}
