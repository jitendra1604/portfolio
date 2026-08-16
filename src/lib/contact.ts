import { isMailerConfigured, sendContactEmail } from "@/lib/mailer";
import type { ContactPayload, ContactResponse } from "@/types/portfolio";

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
