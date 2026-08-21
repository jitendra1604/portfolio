"use client";

import menu from "@/data/menu.json";
import { useGsap } from "@/hooks/useGsap";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

export default function Header() {
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileTl = useRef<gsap.core.Timeline | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("/#home");
  const pathname = usePathname();

  // Scroll-spy only knows about hash sections on "/" — on any other route
  // (e.g. /blog) fall back to matching the route itself, so the nav doesn't
  // keep showing "Home" as active while you're on the blog.
  useEffect(() => {
    const routeItem = menu.find(
      (item) => !item.href.includes("#") && (pathname === item.href || pathname.startsWith(`${item.href}/`))
    );
    if (routeItem) {
      setActive(routeItem.href);
    } else if (pathname === "/") {
      setActive("/#home");
    }
  }, [pathname]);

  const { scope } = useGsap((gsap, scopeEl) => {
    const triggers: ScrollTrigger[] = [];

    // Intro animation
    gsap.fromTo(
      scopeEl.querySelector(".nav-logo"),
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 }
    );

    gsap.fromTo(
      scopeEl.querySelectorAll(".nav-item"),
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.2 }
    );

    // Hide / show on scroll
    let lastScroll = 0;

    const onScroll = () => {
      const current = window.scrollY;

      if (current > lastScroll && current > 80) {
        gsap.to(scopeEl, {
          y: "-100%",
          duration: 0.4,
          ease: "power2.out",
        });
      } else {
        gsap.to(scopeEl, {
          y: "0%",
          duration: 0.4,
          ease: "power2.out",
        });
      }

      lastScroll = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Active section detection. Most sections below the hero are
    // next/dynamic-loaded, so their DOM (and #id) doesn't exist yet on this
    // first pass — only #home resolves immediately. Track what's still
    // missing and watch the DOM for it, instead of silently giving up on
    // every section that hasn't mounted yet.
    const pendingHashes = new Set<string>();

    const registerSection = (hash: string) => {
      const item = menu.find((m) => m.href.endsWith(hash));
      const section = document.querySelector(hash);
      if (!item || !section) return false;

      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActive(item.href),
          onEnterBack: () => setActive(item.href),
        })
      );
      return true;
    };

    menu.forEach((item) => {
      const hashIndex = item.href.indexOf("#");
      if (hashIndex === -1) return;
      const hash = item.href.slice(hashIndex);
      if (!registerSection(hash)) pendingHashes.add(hash);
    });

    let observer: MutationObserver | null = null;
    if (pendingHashes.size > 0) {
      observer = new MutationObserver(() => {
        pendingHashes.forEach((hash) => {
          if (registerSection(hash)) pendingHashes.delete(hash);
        });
        if (pendingHashes.size === 0) {
          observer?.disconnect();
          ScrollTrigger.refresh();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
      triggers.forEach((trigger) => trigger.kill());
    };
  });

  // Mobile animation
  useEffect(() => {
    if (!mobileMenuRef.current) return;

    mobileTl.current = gsap.timeline({ paused: true });

    mobileTl.current
      .fromTo(
        mobileMenuRef.current,
        { y: "-100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.4, ease: "power3.out" }
      )
      .fromTo(
        ".mobile-nav-item",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.3 },
        "-=0.2"
      );

    return () => {
      mobileTl.current?.kill();
      mobileTl.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mobileTl.current) return;

    if (menuOpen) {
      mobileTl.current.play();
    } else {
      mobileTl.current.reverse();
    }
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const updateActiveSection = (href: string) => {
    if (href.includes("#")) setActive(href);
  };

  return (
    <>
      <header
        ref={scope}
        className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md"
      >
        <nav className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
         <div className="nav-logo" data-magnetic>
          <Link href="/#home" aria-label="Go to home">
            <Image
              src="/jeet-logo-nav.png"
              alt="Jeet.dev Logo"
              width={508}
              height={260}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

          {/* Desktop menu */}
          <ul className="hidden md:flex items-center gap-6">
            {menu.map((item) => (
              <li key={item.id} className="nav-item">
                <Link
                  href={item.href}
                  onClick={() => updateActiveSection(item.href)}
                  className={`nav-link relative text-sm transition-colors ${
                    active === item.href
                      ? "text-ink"
                      : "text-caption hover:text-ink"
                  }`}
                  aria-current={active === item.href ? "page" : undefined}
                >
                  {item.label}
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] bg-accent transition-all duration-300 ${
                      active === item.href ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile toggle */}
          <button
            type="button"
            className="-mr-2 p-2 text-xl text-ink md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            ☰
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-navigation"
        ref={mobileMenuRef}
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 overflow-y-auto bg-black py-20 text-white md:hidden ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        {menu.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => {
              updateActiveSection(item.href);
              setMenuOpen(false);
            }}
            className="nav-link mobile-nav-item text-2xl text-ink"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}
