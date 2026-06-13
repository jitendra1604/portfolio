"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGsap } from "@/hooks/useGsap";
import { portfolioData } from "@/lib/portfolio";
import type { ChatMessage } from "@/types/portfolio";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask about Jeet’s background, architecture decisions, workflow, or project details.",
    },
  ]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(
    () => portfolioData.ai.suggestedQuestions,
    []
  );

  const animateEntry = useCallback((gsapInstance: typeof gsap, scopeEl: HTMLElement) => {
    gsapInstance.fromTo(
      scopeEl,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, delay: 0.4, ease: "power3.out" }
    );
  }, []);

  const { scope } = useGsap<HTMLDivElement>(animateEntry);

  useEffect(() => {
    if (!panelRef.current) return;

    if (open) {
      gsap.fromTo(
        panelRef.current,
        { y: 18, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [open]);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const askQuestion = useCallback(
    async (question: string) => {
      const cleanQuestion = question.trim();
      if (!cleanQuestion || loading) return;

      const nextMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: cleanQuestion },
      ];

      setMessages([...nextMessages, { role: "assistant", content: "" }]);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: cleanQuestion,
            history: nextMessages.slice(-6),
          }),
        });

        if (!response.body) {
          throw new Error("No response body returned.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          assistantText += decoder.decode(value, { stream: true });

          setMessages((current) => {
            const updated = [...current];
            updated[updated.length - 1] = {
              role: "assistant",
              content: assistantText,
            };
            return updated;
          });
        }
      } catch {
        setMessages((current) => {
          const updated = [...current];
          updated[updated.length - 1] = {
            role: "assistant",
            content:
              "I hit a problem while generating that answer. Please try again in a moment.",
          };
          return updated;
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  return (
    <div
      ref={scope}
      className="fixed bottom-5 right-5 z-[70] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3"
    >
      {open ? (
        <div
          ref={panelRef}
          className="w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-[#0f0f0f]/95 text-ink shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          <div className="border-b border-line px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-caption">
                  AI Assistant
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  Ask About Jeet
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-line px-3 py-1 text-sm text-caption transition-colors hover:border-line-strong hover:text-ink"
              >
                Close
              </button>
            </div>
          </div>

          <div
            ref={messagesRef}
            className="max-h-[360px] space-y-4 overflow-y-auto px-5 py-4"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-auto bg-ink text-[#0a0a0a]"
                    : "bg-white/[0.04] text-body"
                }`}
              >
                {message.content || (
                  <span className="inline-flex gap-1 text-white/60">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white/50" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white/50 [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white/50 [animation-delay:240ms]" />
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-line px-5 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => askQuestion(suggestion)}
                  className="rounded-full border border-line bg-white/[0.03] px-3 py-2 text-xs text-caption transition-colors hover:border-accent hover:text-ink"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <form
              className="flex gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void askQuestion(input);
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about projects, AI workflow, or architecture"
                className="min-w-0 flex-1 rounded-full border border-line bg-white/[0.03] px-4 py-3 text-sm text-ink transition-colors placeholder:text-caption focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="btn btn-primary shadow-lg"
      >
        Ask AI About Me
      </button>
    </div>
  );
}
