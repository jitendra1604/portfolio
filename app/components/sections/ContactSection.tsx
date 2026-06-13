"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { useGsap } from "@/hooks/useGsap";
import { portfolioData } from "@/lib/portfolio";
import type { ContactPayload, ContactResponse } from "@/types/portfolio";

const initialFormState: ContactPayload = {
  name: "",
  email: "",
  message: "",
};

export default function ContactSection() {
  const contact = portfolioData.contact;
  const [form, setForm] = useState(initialFormState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [feedback, setFeedback] = useState("");
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
      className="bg-background px-6 py-24 text-ink md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2 className="contact-title text-center text-4xl font-bold tracking-tight md:text-5xl">
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
                  className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100"
                >
                  {feedback}
                </div>
              ) : null}
            </div>
          </div>

          <div className="contact-right rounded-xl border border-line bg-surface p-6 sm:p-8">
            <form className="space-y-8" onSubmit={onSubmit}>
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
                  <p className="text-sm text-rose-300">{feedback}</p>
                ) : (
                  <p className="text-sm text-caption">
                    Messages are handled through a lightweight API route and
                    logged for follow-up.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
