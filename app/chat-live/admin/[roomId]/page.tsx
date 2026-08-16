import type { Metadata } from "next";
import AdminChatClient from "./AdminChatClient";

// Never let this leak into search results or crawls.
export const metadata: Metadata = {
  title: "Chat admin",
  robots: { index: false, follow: false },
};

export default async function ChatAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { roomId } = await params;
  const { key } = await searchParams;

  return <AdminChatClient roomId={roomId} initialKey={key ?? null} />;
}
