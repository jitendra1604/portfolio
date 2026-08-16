"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { useGsap } from "@/hooks/useGsap";
import { useAblyChatRoom } from "@/hooks/useAblyChatRoom";
import { useChatBubbleAnimation } from "@/hooks/useChatBubbleAnimation";
import { playReceivedSound, playSentSound } from "@/lib/chat-sounds";

const ROOM_STORAGE_KEY = "chat-live-room-id";
const NAME_STORAGE_KEY = "chat-live-visitor-name";

export default function ChatLiveLauncher() {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const panelRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const seenCountRef = useRef(0);
  const originalTitleRef = useRef<string | null>(null);
  const playedCountRef = useRef<number | null>(null);

  const { scope } = useGsap<HTMLDivElement>((gsapInstance, scopeEl) => {
    gsapInstance.fromTo(
      scopeEl,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, delay: 0.4, ease: "power3.out" }
    );
  });

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
    if (!panelRef.current || !open) return;
    gsap.fromTo(
      panelRef.current,
      { y: 18, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
    );
  }, [open]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Marks messages "seen" while the panel is open, so unreadCount (derived
  // below) only counts what arrived after the visitor last closed it.
  useEffect(() => {
    if (open) seenCountRef.current = messages.length;
  }, [open, messages]);

  const unreadCount = open ? 0 : messages.slice(seenCountRef.current).filter((m) => m.from === "jeet").length;

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

  const startChat = useCallback(
    async (visitorName: string) => {
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
    },
    []
  );

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

  return (
    <div ref={scope} className="fixed bottom-5 right-5 z-[70] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3">
      {open ? (
        <div
          ref={panelRef}
          className="w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-[#0f0f0f]/95 text-ink shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          <div className="border-b border-line px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-caption">Live Chat</p>
                <h3 className="mt-1 text-lg font-semibold">Chat with Jeet</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-line px-3 py-1 text-sm text-caption transition-colors hover:border-line-strong hover:text-ink"
              >
                Close
              </button>
            </div>
            {!needsName ? (
              <p
                role="status"
                aria-live="polite"
                className={`mt-3 text-xs ${status === "active" ? "text-accent" : "text-caption"}`}
              >
                {statusLabel}
              </p>
            ) : null}
          </div>

          {needsName ? (
            <form className="space-y-4 px-5 py-5" onSubmit={onSubmitName}>
              <p className="text-sm text-caption">
                What&apos;s your name? Jeet will see it when he joins.
              </p>
              <input
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="Your name"
                autoFocus
                className="w-full border-b border-line-strong bg-transparent pb-2 text-ink placeholder:text-caption focus:border-accent focus:outline-none"
              />
              {createError ? (
                <p role="alert" className="text-sm text-rose-300">
                  {createError}
                </p>
              ) : null}
              <button type="submit" disabled={!nameInput.trim()} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                Start chat
              </button>
            </form>
          ) : createError ? (
            <p role="alert" className="px-5 py-4 text-sm text-rose-300">
              {createError}
            </p>
          ) : (
            <>
              <div ref={messagesRef} className="max-h-[320px] space-y-3 overflow-y-auto px-5 py-4">
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

              <form className="flex gap-3 border-t border-line px-5 py-4" onSubmit={onSubmitMessage}>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={inputDisabled ? "Chat is not active" : "Type a message"}
                  disabled={inputDisabled}
                  className="min-w-0 flex-1 rounded-full border border-line bg-white/[0.03] px-4 py-3 text-sm text-ink transition-colors placeholder:text-caption focus:border-accent focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={inputDisabled || !input.trim()}
                  className="btn btn-primary px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      ) : null}

      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary relative shadow-lg">
        Chat with me
        {unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white"
          >
            {unreadCount}
          </span>
        ) : null}
        <span className="sr-only" aria-live="polite">
          {unreadCount > 0 ? `${unreadCount} new message${unreadCount === 1 ? "" : "s"} from Jeet` : ""}
        </span>
      </button>
    </div>
  );
}
