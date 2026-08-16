import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { isAblyConfigured, mintChatToken } from "@/lib/ably";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

// Ably's SDK isn't Edge-compatible.
export const runtime = "nodejs";

// Admin-role requests are the real attack surface (secret guessing) — kept
// tight. Visitor-role requests carry no secret to guess; Ably's client calls
// this repeatedly over a session's lifetime (initial connect, renewals, and
// its own retries after any transient failure), so a strict shared limit
// here was locking out legitimate visitor reconnects, not attackers.
const isAdminRateLimited = createRateLimiter(15 * 60 * 1000, 5);
const isVisitorRateLimited = createRateLimiter(15 * 60 * 1000, 60);

const roomIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isAdminSecretValid(candidate: string) {
  const secret = process.env.CHAT_ADMIN_SECRET;
  if (!secret) return false;

  // Hash both sides to a fixed length first so timingSafeEqual never throws
  // on a length mismatch and the comparison itself stays constant-time.
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!isAblyConfigured()) {
    return NextResponse.json({ ok: false, message: "Chat is not available right now." }, { status: 503 });
  }

  const body = (await request.json()) as { roomId?: string; role?: string; adminSecret?: string };
  const { roomId, role } = body;

  if (!roomId || !roomIdPattern.test(roomId)) {
    return NextResponse.json({ ok: false, message: "Invalid room." }, { status: 400 });
  }

  if (role !== "visitor" && role !== "admin") {
    return NextResponse.json({ ok: false, message: "Invalid role." }, { status: 400 });
  }

  const ip = clientIp(request);
  if (role === "admin" ? isAdminRateLimited(ip) : isVisitorRateLimited(ip)) {
    return NextResponse.json({ ok: false, message: "Too many attempts." }, { status: 429 });
  }

  if (role === "admin" && !isAdminSecretValid(body.adminSecret ?? "")) {
    return NextResponse.json({ ok: false, message: "Invalid admin key." }, { status: 401 });
  }

  const ablyToken = await mintChatToken({
    roomId,
    clientId: role === "admin" ? "jeet" : "visitor",
  });

  return NextResponse.json({ ok: true, ablyToken });
}
