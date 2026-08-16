"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Ably from "ably";

export type ChatRole = "visitor" | "admin";

export type ChatMessage = {
  id: string;
  from: "visitor" | "jeet";
  text: string;
  at: number;
};

export type ChatStatus = "connecting" | "waiting" | "active" | "closed" | "error";

type UseAblyChatRoomOptions = {
  roomId: string | null;
  role: ChatRole;
  /** Required when role === "admin"; the server re-checks this on every token renewal. */
  adminSecret?: string;
  /** Shown to the other side via presence — e.g. the visitor's name. */
  displayName?: string;
};

function chatChannelName(roomId: string) {
  return `chat:${roomId}`;
}

export function useAblyChatRoom({ roomId, role, adminSecret, displayName }: UseAblyChatRoomOptions) {
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "failed">(
    "connecting"
  );
  const [closed, setClosed] = useState(false);
  const [peerPresent, setPeerPresent] = useState(false);
  const [peerName, setPeerName] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  // Reset per-connection state synchronously during render when the
  // connection's identity changes, rather than via setState in the effect
  // below (React's recommended "adjusting state when props change" pattern —
  // avoids an extra render/flicker and satisfies the exhaustive-deps rule
  // against setState-in-effect).
  const connectionKey = `${roomId ?? ""}:${role}:${adminSecret ?? ""}:${displayName ?? ""}`;
  const [lastConnectionKey, setLastConnectionKey] = useState(connectionKey);
  if (connectionKey !== lastConnectionKey) {
    setLastConnectionKey(connectionKey);
    setConnectionState("connecting");
    setClosed(false);
    setPeerPresent(false);
    setPeerName(null);
    setMessages([]);
    setErrorMessage(null);
  }

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    const client = new Ably.Realtime({
      clientId: role === "admin" ? "jeet" : "visitor",
      authCallback: async (_params, callback) => {
        try {
          const response = await fetch("/api/chat-live/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomId,
              role,
              adminSecret: role === "admin" ? adminSecret : undefined,
            }),
          });
          const payload = await response.json();
          if (!response.ok || !payload.ok) {
            const message = payload.message ?? "Unable to authenticate.";
            if (!cancelled) setErrorMessage(message);
            callback(message, null);
            return;
          }
          callback(null, payload.ablyToken);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Network error.";
          if (!cancelled) setErrorMessage(message);
          callback(message, null);
        }
      },
    });

    // Rewind so a client that attaches after messages were already published
    // (e.g. the admin joining a minute after the visitor said something)
    // still receives them — works up to 2 minutes on any Ably plan, no
    // persistence/history add-on required, so this stays free and ephemeral.
    const channel = client.channels.get(chatChannelName(roomId), {
      params: { rewind: "2m" },
    });
    channelRef.current = channel;
    const peerClientId = role === "admin" ? "visitor" : "jeet";

    const syncPresence = async () => {
      const members = await channel.presence.get();
      const peer = members.find((member) => member.clientId === peerClientId);
      if (cancelled) return;
      setPeerPresent(Boolean(peer));
      const peerData = peer?.data as { name?: string } | undefined;
      setPeerName(peerData?.name?.trim() || null);
    };

    const onConnected = () => !cancelled && setConnectionState("connected");
    const onFailed = () => !cancelled && setConnectionState("failed");
    client.connection.on("connected", onConnected);
    client.connection.on("failed", onFailed);

    const onMessage = (message: Ably.InboundMessage) => {
      if (cancelled) return;
      const data = message.data as { text: string; from: "visitor" | "jeet" };
      setMessages((current) => [
        ...current,
        {
          id: message.id ?? `${message.timestamp}-${current.length}`,
          from: data.from,
          text: data.text,
          at: message.timestamp ?? Date.now(),
        },
      ]);
    };
    const onClosed = () => !cancelled && setClosed(true);

    (async () => {
      try {
        await channel.attach();
        await channel.subscribe("message", onMessage);
        await channel.subscribe("closed", onClosed);
        await channel.presence.subscribe(["enter", "leave"], syncPresence);
        await channel.presence.enter(displayName ? { name: displayName } : undefined);
        await syncPresence();
      } catch {
        if (!cancelled) setConnectionState("failed");
      }
    })();

    return () => {
      cancelled = true;
      client.connection.off("connected", onConnected);
      client.connection.off("failed", onFailed);
      channel.unsubscribe();
      channel.presence.unsubscribe();
      channel.presence.leave().catch(() => {});
      client.close();
      channelRef.current = null;
    };
    // adminSecret and displayName are both included: they're only ever read
    // once at connect time (auth + presence.enter), and neither is expected
    // to change after the initial connect in this app's actual usage, so
    // including them keeps the closure correct with no practical downside.
  }, [roomId, role, adminSecret, displayName]);

  const status: ChatStatus = useMemo(() => {
    if (closed) return "closed";
    if (connectionState === "failed") return "error";
    if (connectionState !== "connected") return "connecting";
    return peerPresent ? "active" : "waiting";
  }, [closed, connectionState, peerPresent]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !channelRef.current) return;
      channelRef.current.publish("message", {
        text: trimmed,
        from: role === "admin" ? "jeet" : "visitor",
      });
    },
    [role]
  );

  const closeRoom = useCallback(() => {
    channelRef.current?.publish("closed", {});
  }, []);

  return { status, messages, peerPresent, peerName, sendMessage, closeRoom, errorMessage };
}
