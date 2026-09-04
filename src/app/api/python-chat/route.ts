import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Proxy to Python backend chat endpoint
export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    const res = await fetch("http://localhost:8000/api/python/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error(`Python chat ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err), answer: "خطا در ارتباط با سرویس پایتون." },
      { status: 200 }
    );
  }
}
