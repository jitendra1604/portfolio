import Ably from "ably";

const apiKey = process.env.ABLY_API_KEY;

export function isAblyConfigured() {
  return Boolean(apiKey);
}

let restClient: Ably.Rest | null = null;
function getRestClient() {
  if (!apiKey) {
    throw new Error("ABLY_API_KEY is not configured.");
  }
  if (!restClient) {
    restClient = new Ably.Rest({ key: apiKey });
  }
  return restClient;
}

export function chatChannelName(roomId: string) {
  return `chat:${roomId}`;
}

type MintTokenOptions = {
  roomId: string;
  clientId: "visitor" | "jeet";
};

/**
 * Mints a token capability-restricted to exactly one room's channel, so a
 * visitor's token can never read/write any other room.
 */
export async function mintChatToken({ roomId, clientId }: MintTokenOptions) {
  const client = getRestClient();
  const channel = chatChannelName(roomId);

  const tokenRequest = await client.auth.createTokenRequest({
    clientId,
    capability: {
      [channel]: ["publish", "subscribe", "presence"],
    },
    ttl: 60 * 60 * 1000, // 1 hour
  });

  return tokenRequest;
}
