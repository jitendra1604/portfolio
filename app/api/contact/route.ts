import { NextResponse } from "next/server";
import { submitContactMessage } from "@/lib/ai";
import type { ContactPayload } from "@/types/portfolio";

// SMTP (Nodemailer) opens TCP sockets — requires the Node.js runtime, not Edge.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as ContactPayload;
  const result = await submitContactMessage(body);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
