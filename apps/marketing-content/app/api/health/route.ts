import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "marketing-content", time: new Date().toISOString() });
}
