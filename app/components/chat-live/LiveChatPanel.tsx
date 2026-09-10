"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useAblyChatRoom } from "@/hooks/useAblyChatRoom";
import { useChatBubbleAnimation } from "@/hooks/useChatBubbleAnimation";
import { playReceivedSound, playSentSound } from "@/lib/chat-sounds";

const ROOM_STORAGE_KEY = "chat-live-room-id";
const NAME_STORAGE_KEY = "chat-live-visitor-name";

/**
 * Inline live-chat surface. Lives inside the contact card (no fixed
 * positioning, no launcher button) so the contact form and the chat share
 * one visual container instead of competing as two separate UIs.
 */
export default function LiveChatPanel({ active = true }: { active?: boolean }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const seenCountRef = useRef(0);
  const originalTitleRef = useRef<string | null>(null);
  const playedCountRef = useRef<number | null>(null);

  useEffect(() => {
    const storedRoom = sessionStorage.getItem(ROOM_STORAGE_KEY);
    if (storedRoom) setRoomId(storedRoom);
    const storedName = sessionStorage.getItem(NAME_STORAGE_KEY);
    if (storedName) setName(storedName);
  }, []);

  const { status, messages, sendMessage, errorMessage: connectionError } = useAblyChatRoom({
    roomId,
    role: "visitor",
    displayName: name ?? undefined,
  });
  const registerBubble = useChatBubbleAnimation(messages);

  useEffect(() => {
    if (status === "closed") {
      sessionStorage.removeItem(ROOM_STORAGE_KEY);
    }
  }, [status]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Marks messages "seen" while the chat tab is visible, so unreadCount
  // (derived below) only counts what arrived while it was hidden.
  useEffect(() => {
    if (active) seenCountRef.current = messages.length;
  }, [active, messages]);

  const unreadCount = active ? 0 : messages.slice(seenCountRef.current).filter((m) => m.from === "jeet").length;

  // Plays a receive chime for genuinely new incoming messages only — the
  // first run just baselines against whatever rewind delivered on connect,
  // so reconnecting to an existing conversation doesn't replay old pings.
  useEffect(() => {
    if (playedCountRef.current === null) {
      playedCountRef.current = messages.length;
      return;
    }
    const newOnes = messages.slice(playedCountRef.current);
    playedCountRef.current = messages.length;
    if (newOnes.some((m) => m.from === "jeet")) playReceivedSound();
  }, [messages]);

  // Tab-title flicker so a reply is noticeable even if this tab isn't
  // focused — no browser permission prompt needed, unlike Notification API.
  useEffect(() => {
    if (originalTitleRef.current === null) originalTitleRef.current = document.title;
    const base = originalTitleRef.current;
    document.title = unreadCount > 0 ? `(${unreadCount}) ${base}` : base;
    return () => {
      if (originalTitleRef.current !== null) document.title = originalTitleRef.current;
    };
  }, [unreadCount]);

  const startChat = useCallback(async (visitorName: string) => {
    setCreating(true);
    setCreateError(null);
    try {
      const response = await fetch("/api/chat-live/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: visitorName }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setCreateError(payload.message ?? "Couldn't start a chat right now.");
        return;
      }
      sessionStorage.setItem(ROOM_STORAGE_KEY, payload.roomId);
      setRoomId(payload.roomId);
    } catch {
      setCreateError("Couldn't start a chat right now. Check your connection and try again.");
    } finally {
      setCreating(false);
    }
  }, []);

  const onSubmitName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    sessionStorage.setItem(NAME_STORAGE_KEY, trimmed);
    setName(trimmed);
    startChat(trimmed);
  };

  const onSubmitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status !== "active" && status !== "waiting") return;
    sendMessage(input);
    playSentSound();
    setInput("");
  };

  const statusLabel =
    status === "error" || (status === "connecting" && connectionError)
      ? connectionError ?? "Something went wrong."
      : status === "connecting" || creating
        ? "Connecting…"
        : status === "waiting"
          ? "Waiting for Jeet to join…"
          : status === "active"
            ? "Jeet is here"
            : status === "closed"
              ? "This conversation has ended."
              : "Something went wrong.";

  const inputDisabled = status !== "active" && status !== "waiting";
  const needsName = !roomId && !creating;

  const dotColor =
    status === "active"
      ? "bg-accent"
      : status === "error" || (status === "connecting" && connectionError)
        ? "bg-rose-400"
        : status === "closed"
          ? "bg-muted"
          : "bg-amber-400";

  return (
    <div className="flex h-[420px] flex-col sm:h-[460px]">
      <div className="flex items-center gap-3 pb-5">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 font-display text-sm font-semibold text-accent">
          J
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface ${dotColor}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-ink">Chat with Jeet</p>
          <p role="status" aria-live="polite" className="mt-0.5 truncate text-xs text-caption">
            {needsName ? "Usually replies within a few minutes" : statusLabel}
          </p>
        </div>
      </div>

      {needsName ? (
        <form className="space-y-6 border-t border-line pt-6" onSubmit={onSubmitName}>
          <p className="text-sm leading-relaxed text-body">
            Say hello 👋 — what should Jeet call you?
          </p>
          <div>
            <label htmlFor="chat-name" className="mb-2 block text-sm text-caption">
              Your Name
            </label>
            <input
              id="chat-name"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder="Jane Doe"
              className="w-full border-b border-line-strong bg-transparent pb-2 text-ink transition-colors placeholder:text-caption focus:border-accent focus:outline-none"
            />
          </div>
          {createError ? (
            <p role="alert" className="text-sm text-rose-300">
              {createError}
            </p>
          ) : null}
          <button
            type="submit"
            data-magnetic
            disabled={!nameInput.trim() || creating}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Starting…" : "Start chat"}
          </button>
        </form>
      ) : createError ? (
        <p role="alert" className="border-t border-line pt-6 text-sm text-rose-300">
          {createError}
        </p>
      ) : (
        <>
          <div
            ref={messagesRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto border-t border-line py-5"
          >
            {messages.length === 0 ? (
              <p className="text-sm text-caption">
                Say hello — Jeet gets notified the moment you start this chat.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  ref={registerBubble(message.id)}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.from === "visitor"
                      ? "ml-auto bg-ink text-[#0a0a0a]"
                      : "bg-white/[0.04] text-body"
                  }`}
                >
                  {message.text}
                </div>
              ))
            )}
          </div>

          <form className="flex gap-3 border-t border-line pt-5" onSubmit={onSubmitMessage}>
            <label htmlFor="chat-message" className="sr-only">
              Your Message
            </label>
            <input
              id="chat-message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={inputDisabled ? "Chat is not active" : "Type a message"}
              disabled={inputDisabled}
              className="min-w-0 flex-1 border-b border-line-strong bg-transparent pb-2 text-ink transition-colors placeholder:text-caption focus:border-accent focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={inputDisabled || !input.trim()}
              className="btn btn-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
