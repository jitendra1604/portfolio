"use client";

import { useGsap } from "@/hooks/useGsap";
import portfolioData from "@/data/portfolio.json";

export default function ContactSection() {
  const contact = portfolioData?.contact;

  const { scope } = useGsap((gsap, scopeEl) => {
    const q = gsap.utils.selector(scopeEl);

    gsap.from(q(".contact-title"), {
      scrollTrigger: {
        trigger: scopeEl,
        start: "top 85%",
        once: true,
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
    });

    gsap.from(q(".contact-left"), {
      scrollTrigger: {
        trigger: scopeEl,
        start: "top 80%",
      },
      x: -50,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
    });

    gsap.from(q(".contact-right"), {
      scrollTrigger: {
        trigger: scopeEl,
        start: "top 80%",
      },
      x: 50,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  }, []);

  if (!contact) return null;

  return (
    <section
      id="contact"
      ref={scope}
      className="py-32 bg-black text-white px-6"
    >
      <div className="max-w-6xl mx-auto">

        <h2 className="contact-title text-4xl md:text-5xl font-bold mb-20 tracking-tight text-center">
          Let’s Build Something Meaningful
        </h2>

        <div className="grid md:grid-cols-2 gap-16">

          {/* LEFT SIDE */}
          <div className="contact-left space-y-8">

            <p className="text-gray-400 leading-relaxed max-w-md">
              I enjoy working on systems that scale, products that matter,
              and problems that are slightly uncomfortable to solve.
              If you’re building something ambitious, I’d love to hear about it.
            </p>

            <div className="space-y-4 text-white/70">
              <div>
                <span className="block text-sm text-white/40">Email</span>
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-white transition-colors"
                >
                  {contact.email}
                </a>
              </div>

              <div>
                <span className="block text-sm text-white/40">Location</span>
                <span>{contact.location}</span>
              </div>

              <div className="flex gap-6 pt-4">
                <a
                  href={contact.linkedin}
                  target="_blank"
                  className="hover:text-white transition-colors"
                >
                  LinkedIn
                </a>

                <a
                  href={contact.github}
                  target="_blank"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE FORM */}
          <div className="contact-right border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm">

            <form className="space-y-8">

              <div className="relative">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-transparent border-b border-white/20 pb-2 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="relative">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full bg-transparent border-b border-white/20 pb-2 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="relative">
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full bg-transparent border-b border-white/20 pb-2 focus:outline-none focus:border-white transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="contact-trigger mt-6 px-8 py-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all duration-300"
              >
                Send Message
              </button>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}