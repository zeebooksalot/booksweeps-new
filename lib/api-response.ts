import { NextResponse } from 'next/server'

export const ok = <T>(data: T, message?: string) =>
  NextResponse.json({ success: true, data, message })

export const fail = (message: string, status = 400) =>
  NextResponse.json({ success: false, error: message }, { status })