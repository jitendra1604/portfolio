import { randomUUID } from "node:crypto";
import { NextResponse, after } from "next/server";
import { isAblyConfigured } from "@/lib/ably";
import { notifyNewChatRoom } from "@/lib/chat-notify";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

// Ably's SDK isn't Edge-compatible.
export const runtime = "nodejs";

// Each hit pings two of the owner's devices — keep this tighter than the
// contact form's limiter.
const isRateLimited = createRateLimiter(15 * 60 * 1000, 3);

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: "Too many chat requests. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  if (!isAblyConfigured()) {
    console.error("[chat-live] ABLY_API_KEY is not configured.");
    return NextResponse.json(
      { ok: false, message: "Chat is not available right now." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as { name?: string };
  const name = body.name?.trim().slice(0, 60) || undefined;

  const roomId = randomUUID();

  // Never block the visitor's room creation on a flaky third-party notifier,
  // but still guarantee it runs to completion — Vercel can freeze the
  // function the instant the response is sent, so a plain un-awaited
  // promise here isn't reliably delivered under real traffic.
  after(() =>
    notifyNewChatRoom(roomId, name).catch((error) => {
      console.error("[chat-live] notifyNewChatRoom failed", error);
    })
  );

  return NextResponse.json({ ok: true, roomId });
}
