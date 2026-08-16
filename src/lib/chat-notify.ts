import { siteUrl } from "@/lib/site";

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
const callMeBotPhone = process.env.CALLMEBOT_PHONE;
const callMeBotApiKey = process.env.CALLMEBOT_APIKEY;
const chatAdminSecret = process.env.CHAT_ADMIN_SECRET;

export function isTelegramConfigured() {
  return Boolean(telegramBotToken && telegramChatId);
}

export function isCallMeBotConfigured() {
  return Boolean(callMeBotPhone && callMeBotApiKey);
}

function adminJoinUrl(roomId: string) {
  const url = new URL(`/chat-live/admin/${roomId}`, siteUrl);
  if (chatAdminSecret) url.searchParams.set("key", chatAdminSecret);
  return url.toString();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendTelegramNotification(roomId: string, name?: string) {
  if (!isTelegramConfigured()) return;

  // Telegram only auto-links plain URLs that look like real public domains —
  // it won't linkify http://localhost:... (and might not reliably linkify
  // every production host either), so send an explicit HTML anchor instead
  // of relying on its plain-text auto-detection.
  const joinUrl = adminJoinUrl(roomId);
  const text = `New portfolio chat request from ${escapeHtml(name || "a visitor")}.\n\n<a href="${escapeHtml(joinUrl)}">Join chat</a>`;
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: telegramChatId, text, parse_mode: "HTML" }),
  });

  if (!response.ok) {
    throw new Error(`Telegram notify failed: ${response.status}`);
  }
}

async function sendCallMeBotNotification(roomId: string, name?: string) {
  if (!isCallMeBotConfigured()) return;

  const text = `New portfolio chat request from ${name || "a visitor"}. Join: ${adminJoinUrl(roomId)}`;
  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", callMeBotPhone!);
  url.searchParams.set("apikey", callMeBotApiKey!);
  url.searchParams.set("text", text);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`CallMeBot notify failed: ${response.status}`);
  }
}

/**
 * Fires both notifications in parallel and never throws — a flaky
 * third-party notifier should never block room creation for the visitor.
 * Falls back to a console log when neither channel is configured, so local
 * dev still surfaces that a chat was requested.
 */
export async function notifyNewChatRoom(roomId: string, name?: string) {
  if (!isTelegramConfigured() && !isCallMeBotConfigured()) {
    console.info("[chat-live] (no notification channel configured)", {
      roomId,
      name,
      joinUrl: adminJoinUrl(roomId),
    });
    return;
  }

  const results = await Promise.allSettled([
    sendTelegramNotification(roomId, name),
    sendCallMeBotNotification(roomId, name),
  ]);

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const channel = index === 0 ? "telegram" : "callmebot";
      console.error(`[chat-live] ${channel} notify failed`, result.reason);
    }
  });
}
