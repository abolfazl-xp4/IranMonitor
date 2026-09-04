import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Proxy to Python backend AI agents endpoint
export async function GET() {
  try {
    const res = await fetch("http://localhost:8000/api/python/agents", {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Python API ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err), agents: [] },
      { status: 200 }
    );
  }
}
