import { NextRequest, NextResponse } from "next/server";

const GAS_BACKEND = process.env.NEXT_PUBLIC_GAS_WEB_APP_URL ?? "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = new URL(GAS_BACKEND);
  searchParams.forEach((v, k) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { cache: "no-store" });
  const text = await res.text();
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ success: false, error: `GAS error (${res.status}): ${text.substring(0, 300)}` });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const res = await fetch(GAS_BACKEND, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body,
  });
  const text = await res.text();
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ success: false, error: `GAS error (${res.status}): ${text.substring(0, 300)}` });
  }
}
