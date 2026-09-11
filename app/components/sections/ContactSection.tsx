"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { useGsap } from "@/hooks/useGsap";
import { portfolioData } from "@/lib/portfolio";
import LiveChatPanel from "../chat-live/LiveChatPanel";
import type { ContactPayload, ContactResponse } from "@/types/portfolio";
import { track } from "@vercel/analytics";

const initialFormState: ContactPayload = {
  name: "",
  email: "",
  message: "",
  website: "",
};

export default function ContactSection() {
  const contact = portfolioData.contact;
  const [form, setForm] = useState(initialFormState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [feedback, setFeedback] = useState("");
  const [tab, setTab] = useState<"form" | "chat">("form");
  const successBadgeRef = useRef<HTMLDivElement | null>(null);

  const animateSection = useCallback((gsapInstance: typeof gsap, scopeEl: HTMLElement) => {
    const q = gsapInstance.utils.selector(scopeEl);

    gsapInstance.fromTo(
      q(".contact-title"),
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scopeEl,
          start: "top 85%",
          once: true,
        },
      }
    );

    gsapInstance.fromTo(
      q(".contact-left"),
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scopeEl,
          start: "top 80%",
        },
      }
    );

    gsapInstance.fromTo(
      q(".contact-right"),
      { x: 50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scopeEl,
          start: "top 80%",
        },
      }
    );
  }, []);

  const { scope } = useGsap(animateSection);

  useEffect(() => {
    if (status !== "success" || !successBadgeRef.current) return;

    gsap.fromTo(
      successBadgeRef.current,
      { scale: 0.92, opacity: 0, y: 16 },
      { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );
  }, [status]);

  // A "/#chat" link (header nav, hero, blog CTAs) lands on the same contact
  // card and just flips it to the live-chat tab — one destination for every
  // "talk to me" entry point instead of a separate floating widget.
  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash !== "#chat") return;
      setTab("chat");
      // This section is next/dynamic-loaded, so on a cold load with #chat the
      // browser has already given up on scrolling to it by the time it exists.
      document.getElementById("chat")?.scrollIntoView({ block: "center" });
    };
    // Next's <Link> pushes history without a hashchange event, so a same-page
    // click on a #chat link never reached syncFromHash. Catch the click itself
    // and let the router do the scrolling.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (!/#chat$/.test(href)) return;
      setTab("chat");
      // The router scrolls immediately, but the dynamic sections above this
      // one are still mounting and push the card down after it has scrolled.
      // Re-aim once they have settled.
      window.setTimeout(() => {
        document.getElementById("chat")?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 450);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as ContactResponse;
      setStatus(payload.ok ? "success" : "error");
      setFeedback(payload.message);

      if (payload.ok) {
        track("contact_form_submitted");
        setForm(initialFormState);
      }
    } catch {
      setStatus("error");
      setFeedback("Something went wrong while sending your message.");
    }
  };

  return (
    <section
      id="contact"
      ref={scope}
      className="bg-background px-6 py-20 text-ink md:py-28"
    >
      <div className="mx-auto max-w-[1200px]">
        <p className="contact-title text-center text-xs uppercase tracking-[0.3em] text-caption">Contact</p>
        <h2 className="contact-title mt-3 text-center text-4xl font-bold tracking-tight md:text-5xl">
          Let’s Build Something Meaningful
        </h2>

        <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="contact-left space-y-8">
            <p className="max-w-md text-base leading-relaxed text-body">
              I enjoy working on systems that scale, products that matter, and
              problems that are slightly uncomfortable to solve. If you’re
              building something ambitious, I’d love to hear about it.
            </p>

            <div className="space-y-4 text-body">
              <div>
                <span className="block text-sm text-caption">Email</span>
                <a
                  href={`mailto:${contact.email}`}
                  className="transition-colors hover:text-accent"
                >
                  {contact.email}
                </a>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors hover:text-accent"
                >
                  LinkedIn
                </a>

                <a
                  href={contact.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors hover:text-accent"
                >
                  GitHub
                </a>
              </div>

              {status === "success" ? (
                <div
                  ref={successBadgeRef}
                  role="status"
                  aria-live="polite"
                  className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100"
                >
                  {feedback}
                </div>
              ) : null}
            </div>
          </div>

          <div id="chat" className="contact-right scroll-mt-24 rounded-xl border border-line bg-surface p-6 sm:p-8">
            <div role="tablist" aria-label="How to reach Jeet" className="mb-8 flex gap-1 rounded-full border border-line bg-white/[0.02] p-1">
              {([
                { id: "form", label: "Send a message" },
                { id: "chat", label: "Live chat" },
              ] as const).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`contact-tab-${item.id}`}
                  aria-selected={tab === item.id}
                  aria-controls={`contact-panel-${item.id}`}
                  onClick={() => setTab(item.id)}
                  className={`flex-1 rounded-full px-4 py-2 text-sm transition-colors ${
                    tab === item.id
                      ? "bg-ink font-medium text-background"
                      : "text-caption hover:text-ink"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              role="tabpanel"
              id="contact-panel-form"
              aria-labelledby="contact-tab-form"
              hidden={tab !== "form"}
            >
            <form className="space-y-8" onSubmit={onSubmit}>
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} />
              </div>
              <div className="relative">
                <label htmlFor="contact-name" className="mb-2 block text-sm text-caption">
                  Your Name
                </label>
                <input
                  id="contact-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  type="text"
                  placeholder="Jane Doe"
                  className="w-full border-b border-line-strong bg-transparent pb-2 text-ink transition-colors placeholder:text-caption focus:border-accent focus:outline-none"
                />
              </div>

              <div className="relative">
                <label htmlFor="contact-email" className="mb-2 block text-sm text-caption">
                  Your Email
                </label>
                <input
                  id="contact-email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  type="email"
                  placeholder="jane@example.com"
                  className="w-full border-b border-line-strong bg-transparent pb-2 text-ink transition-colors placeholder:text-caption focus:border-accent focus:outline-none"
                />
              </div>

              <div className="relative">
                <label htmlFor="contact-message" className="mb-2 block text-sm text-caption">
                  Your Message
                </label>
                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  placeholder="Tell me what you're building and where you need help."
                  rows={5}
                  className="w-full resize-none border-b border-line-strong bg-transparent pb-2 text-ink transition-colors placeholder:text-caption focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  data-magnetic
                  disabled={status === "loading"}
                  className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
                </button>

                {status === "error" ? (
                  <p role="alert" className="text-sm text-rose-300">{feedback}</p>
                ) : null}
              </div>
            </form>
            </div>

            {/* Mounted regardless of the active tab so an in-flight
                conversation keeps its Ably connection (and unread count)
                while the visitor is looking at the form. */}
            <div
              role="tabpanel"
              id="contact-panel-chat"
              aria-labelledby="contact-tab-chat"
              hidden={tab !== "chat"}
            >
              <LiveChatPanel active={tab === "chat"} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
