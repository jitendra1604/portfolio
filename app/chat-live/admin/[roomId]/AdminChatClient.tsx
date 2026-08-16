"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAblyChatRoom } from "@/hooks/useAblyChatRoom";
import { playReceivedSound, playSentSound } from "@/lib/chat-sounds";

const SECRET_STORAGE_KEY = "chat-live-admin-secret";

export default function AdminChatClient({
  roomId,
  initialKey,
}: {
  roomId: string;
  initialKey: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Derived directly from the (server-passed) prop — SSR-safe, no effect
  // needed for this part. A returning visitor without a `?key=` link falls
  // back to whatever's pre-filled into the manual form below.
  const [adminSecret, setAdminSecret] = useState<string | null>(initialKey);
  const [secretInput, setSecretInput] = useState(() =>
    typeof window === "undefined" ? "" : sessionStorage.getItem(SECRET_STORAGE_KEY) ?? ""
  );
  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const playedCountRef = useRef<number | null>(null);

  // Side effects only: persist the link-supplied key for next time, and
  // scrub it from the visible URL/history immediately after reading it.
  useEffect(() => {
    if (!initialKey) return;
    sessionStorage.setItem(SECRET_STORAGE_KEY, initialKey);
    router.replace(pathname);
  }, [initialKey, pathname, router]);

  const { status, messages, peerPresent, peerName, sendMessage, closeRoom, errorMessage } = useAblyChatRoom({
    roomId,
    role: "admin",
    adminSecret: adminSecret ?? undefined,
  });

  useEffect(() => {
    if (status === "error" && adminSecret) {
      sessionStorage.removeItem(SECRET_STORAGE_KEY);
    }
  }, [status, adminSecret]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Plays a receive chime for genuinely new incoming messages only — the
  // first run just baselines against whatever rewind delivered on connect.
  useEffect(() => {
    if (playedCountRef.current === null) {
      playedCountRef.current = messages.length;
      return;
    }
    const newOnes = messages.slice(playedCountRef.current);
    playedCountRef.current = messages.length;
    if (newOnes.some((m) => m.from === "visitor")) playReceivedSound();
  }, [messages]);

  const onSubmitSecret = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = secretInput.trim();
    if (!trimmed) return;
    sessionStorage.setItem(SECRET_STORAGE_KEY, trimmed);
    setAdminSecret(trimmed);
  };

  const onSubmitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status !== "active" && status !== "waiting") return;
    sendMessage(input);
    playSentSound();
    setInput("");
  };

  if (!adminSecret || (status === "error" && errorMessage)) {
    return (
      <section className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-md flex-col justify-center px-6 py-16 text-ink">
        <h1 className="text-2xl font-semibold">Chat admin</h1>
        <p className="mt-2 text-sm text-caption">Enter your admin key to join this conversation.</p>
        {errorMessage ? (
          <p role="alert" className="mt-4 text-sm text-rose-300">
            {errorMessage}
          </p>
        ) : null}
        <form className="mt-6 space-y-4" onSubmit={onSubmitSecret}>
          <input
            type="password"
            value={secretInput}
            onChange={(event) => setSecretInput(event.target.value)}
            placeholder="Admin key"
            className="w-full border-b border-line-strong bg-transparent pb-2 text-ink placeholder:text-caption focus:border-accent focus:outline-none"
          />
          <button type="submit" className="btn btn-primary">
            Join chat
          </button>
        </form>
      </section>
    );
  }

  const statusLabel =
    status === "error" || (status === "connecting" && errorMessage)
      ? errorMessage ?? "Something went wrong."
      : status === "connecting"
        ? "Connecting…"
        : status === "waiting"
          ? `Waiting for ${peerName || "the visitor"}…`
          : status === "active"
            ? `${peerName || "Visitor"} is here`
            : status === "closed"
              ? "You closed this conversation."
              : "Something went wrong.";

  const inputDisabled = status !== "active" && status !== "waiting";

  return (
    <section className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-2xl flex-col px-6 py-10 text-ink">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="text-xl font-semibold">Chat room</h1>
          <p role="status" aria-live="polite" className={`mt-1 text-xs ${peerPresent ? "text-accent" : "text-caption"}`}>
            {statusLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={closeRoom}
          disabled={status === "closed"}
          className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Close chat
        </button>
      </div>

      <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto py-6">
        {messages.length === 0 ? (
          <p className="text-sm text-caption">No messages yet.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`animate-message-pop max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.from === "jeet" ? "ml-auto bg-ink text-[#0a0a0a]" : "bg-white/[0.04] text-body"
              }`}
            >
              {message.text}
            </div>
          ))
        )}
      </div>

      <form className="flex gap-3 border-t border-line pt-4" onSubmit={onSubmitMessage}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={inputDisabled ? "Chat is not active" : "Type a message"}
          disabled={inputDisabled}
          className="min-w-0 flex-1 rounded-full border border-line bg-white/[0.03] px-4 py-3 text-sm text-ink placeholder:text-caption focus:border-accent focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={inputDisabled || !input.trim()}
          className="btn btn-primary px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </section>
  );
}
