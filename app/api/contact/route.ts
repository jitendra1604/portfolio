import { NextResponse } from "next/server";
import { submitContactMessage } from "@/lib/contact";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import type { ContactPayload } from "@/types/portfolio";

// SMTP (Nodemailer) opens TCP sockets — requires the Node.js runtime, not Edge.
export const runtime = "nodejs";

const isRateLimited = createRateLimiter(10 * 60 * 1000, 5);

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }
  const body = (await request.json()) as ContactPayload;
  if (body.website?.trim()) {
    return NextResponse.json({ ok: true, message: "Message received." });
  }
  const result = await submitContactMessage(body);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
