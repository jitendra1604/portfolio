import nodemailer, { type Transporter } from "nodemailer";
import type { ContactPayload } from "@/types/portfolio";

// Defaults target Gmail SMTP; override via env for any other provider.
const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT ?? 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const to = process.env.CONTACT_TO ?? user;

/** True only when we have enough config to actually send mail. */
export function isMailerConfigured() {
  return Boolean(user && pass && to);
}

let transporter: Transporter | null = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
      auth: { user, pass },
    });
  }
  return transporter;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendContactEmail(payload: ContactPayload) {
  const transport = getTransporter();

  await transport.sendMail({
    // Gmail requires the From address to be the authenticated account.
    from: `"Portfolio — ${payload.name}" <${user}>`,
    to,
    replyTo: `"${payload.name}" <${payload.email}>`,
    subject: `New portfolio message from ${payload.name}`,
    text: `Name: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`,
    html: `
      <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#111">
        <h2 style="margin:0 0 12px">New portfolio message</h2>
        <p style="margin:0"><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
        <p style="margin:0"><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:16px 0" />
        <p style="white-space:pre-wrap;margin:0">${escapeHtml(payload.message)}</p>
      </div>
    `,
  });
}
