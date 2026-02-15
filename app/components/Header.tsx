"use client";

import menu from "@/data/menu.json";
import { useGsap } from "@/hooks/useGsap";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function Header() {
  const { scope } = useGsap((gsap, scopeEl) => {
    // Intro animation
    gsap.from(scopeEl.querySelector(".nav-logo"), {
      y: -40,
      opacity: 0,
      duration: 0.6,
    });

    gsap.from(scopeEl.querySelectorAll(".nav-item"), {
      y: -30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      delay: 0.2,
    });

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

    window.addEventListener("scroll", onScroll);

    // Active section detection
    menu.forEach((item) => {
      const section = document.querySelector(item.href);
      if (!section) return;

      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActive(item.href),
        onEnterBack: () => setActive(item.href),
      });
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileTl = useRef<gsap.core.Timeline | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("#home");

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
      .from(
        ".mobile-nav-item",
        {
          y: 30,
          opacity: 0,
          stagger: 0.08,
          duration: 0.3,
        },
        "-=0.2"
      );
  }, []);

  useEffect(() => {
    if (!mobileTl.current) return;
    menuOpen ? mobileTl.current.play() : mobileTl.current.reverse();
  }, [menuOpen]);

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        ref={scope}
        className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md"
      >
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
         <div className="nav-logo">
          <Image
            src="/jeet-logo.png" // put your generated PNG in the public folder
            alt="Jeet.dev Logo"
            width={180} // adjust as needed
            height={40} // adjust as needed
            priority
          />
        </div>

          {/* Desktop menu */}
          <ul className="hidden md:flex items-center gap-6">
            {menu.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  onClick={() => scrollToSection(item.href)}
                  className={`relative text-sm transition-colors ${
                    active === item.href
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] bg-white transition-all duration-300 ${
                      active === item.href ? "w-full" : "w-0"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white text-xl"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-0 z-40 bg-black text-white flex flex-col items-center justify-center gap-8 md:hidden ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              scrollToSection(item.href);
              setMenuOpen(false);
            }}
            className="nav-link mobile-nav-item text-2xl"
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}