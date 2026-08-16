"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import type { ChatMessage } from "@/hooks/useAblyChatRoom";

/**
 * Animates each chat bubble in once, the moment its DOM node first exists —
 * never replays on ordinary re-renders. Multiple bubbles appearing in the
 * same pass (e.g. history delivered on reconnect) cascade in with a slight
 * stagger instead of popping in all at once.
 */
export function useChatBubbleAnimation(messages: ChatMessage[]) {
  const nodesRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const animatedRef = useRef<Set<string>>(new Set());

  useLayoutEffect(() => {
    const newEls: HTMLDivElement[] = [];
    messages.forEach((message) => {
      if (animatedRef.current.has(message.id)) return;
      const el = nodesRef.current.get(message.id);
      if (!el) return;
      animatedRef.current.add(message.id);
      newEls.push(el);
    });
    if (newEls.length === 0) return;

    gsap.fromTo(
      newEls,
      { y: 14, scale: 0.85, opacity: 0, transformOrigin: "bottom" },
      { y: 0, scale: 1, opacity: 1, duration: 0.32, ease: "power3.out", stagger: 0.05 }
    );
  }, [messages]);

  return (id: string) => (el: HTMLDivElement | null) => {
    if (el) nodesRef.current.set(id, el);
    else nodesRef.current.delete(id);
  };
}
