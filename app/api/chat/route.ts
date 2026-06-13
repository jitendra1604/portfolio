import { NextResponse } from "next/server";
import { streamPortfolioAnswer } from "@/lib/ai";
import type { ChatMessage } from "@/types/portfolio";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    question?: string;
    history?: ChatMessage[];
  };

  const question = body.question?.trim();

  if (!question) {
    return NextResponse.json(
      { message: "Question is required." },
      { status: 400 }
    );
  }

  const stream = await streamPortfolioAnswer(question, body.history ?? []);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
