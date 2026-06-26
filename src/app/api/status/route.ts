import { NextResponse } from "next/server";
import { MOCK, HAS_NEBIUS } from "@/lib/gmi";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ mock: MOCK, providers: { gmi: !MOCK, nebius: HAS_NEBIUS } });
}
