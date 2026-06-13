import { findRelevantPortfolioContext } from "@/lib/embeddings";
import { portfolioData } from "@/lib/portfolio";
import { isMailerConfigured, sendContactEmail } from "@/lib/mailer";
import type { ChatMessage, ContactPayload, ContactResponse } from "@/types/portfolio";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-4.1-mini";

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function createStreamFromText(text: string) {
  const encoder = new TextEncoder();
  const words = text.split(/(\s+)/).filter(Boolean);

  return new ReadableStream({
    start(controller) {
      let index = 0;

      const pushChunk = () => {
        if (index >= words.length) {
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(words[index]));
        index += 1;
        setTimeout(pushChunk, 20);
      };

      pushChunk();
    },
  });
}

function createFallbackAnswer(question: string, contextText: string) {
  return [
    "I’m answering from Jeet’s portfolio context because no OpenAI API key is configured.",
    `Question: ${question}`,
    `Relevant context: ${contextText}`,
    "Jeet is a senior full stack developer focused on scalable web platforms, Next.js, React, Node.js, AWS, and system design. If you want, ask about a specific project, tech decision, workflow, or how AI tools fit into his delivery process.",
  ].join("\n\n");
}

export async function streamPortfolioAnswer(
  question: string,
  history: ChatMessage[] = []
) {
  const context = await findRelevantPortfolioContext(question, 3);
  const contextText = context
    .map(
      (item, index) =>
        `Context ${index + 1}: ${item.title}\n${item.text}`
    )
    .join("\n\n");

  if (!OPENAI_API_KEY) {
    return createStreamFromText(createFallbackAnswer(question, contextText));
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: [
            portfolioData.ai.systemPrompt,
            "Answer as Jeet's portfolio AI guide.",
            "Stay grounded in the supplied portfolio context.",
            "If the context is thin, say so clearly and avoid inventing specifics.",
          ].join(" "),
        },
        ...history.slice(-4).map((message) => ({
          role: message.role,
          content: message.content,
        })),
        {
          role: "user",
          content: [
            `Question: ${question}`,
            "Portfolio context:",
            contextText,
          ].join("\n\n"),
        },
      ],
    }),
  });

  if (!response.ok) {
    return createStreamFromText(createFallbackAnswer(question, contextText));
  }

  const payload = (await response.json()) as OpenAIChatResponse;
  const text =
    payload.choices?.[0]?.message?.content ??
    createFallbackAnswer(question, contextText);

  return createStreamFromText(text);
}

export async function submitContactMessage(
  payload: ContactPayload
): Promise<ContactResponse> {
  const cleanPayload = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    message: payload.message.trim(),
  };

  if (!cleanPayload.name || !cleanPayload.email || !cleanPayload.message) {
    return {
      ok: false,
      message: "Please complete all fields before sending your message.",
    };
  }

  if (!cleanPayload.email.includes("@")) {
    return {
      ok: false,
      message: "Please provide a valid email address.",
    };
  }

  try {
    if (isMailerConfigured()) {
      await sendContactEmail(cleanPayload);
    } else {
      // No SMTP credentials (e.g. local dev) — log instead of failing.
      console.info("[contact-submission] (SMTP not configured)", {
        ...cleanPayload,
        receivedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("[contact-email-failed]", error);
    return {
      ok: false,
      message:
        "Sorry — your message couldn’t be sent right now. Please email me directly.",
    };
  }

  return {
    ok: true,
    message: "Message received. Jeet will get back to you soon.",
  };
}
