"use client";

import { useGsap } from "@/hooks/useGsap";

export default function Hero() {
  const { scope, ready } = useGsap((gsap) => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero-title", { y: 80, opacity: 0, duration: 1 })
      .from(".hero-subtitle", { y: 40, opacity: 0, duration: 0.8 }, "-=0.5")
      .from(".hero-cta", { scale: 0.8, opacity: 0, duration: 0.6 }, "-=0.4");
  }, []);

  return (
    <>
      {!ready && (
        <div className="fixed inset-0 z-[9999] bg-black" />
      )}

      <section
        ref={scope}
        className="min-h-screen flex flex-col justify-center items-center bg-black text-white"
      >
        <h1 className="hero-title text-6xl font-bold">Next.js + GSAP</h1>
        <p className="hero-subtitle mt-4 text-xl text-gray-300">
          Smooth animations. No jank. No flashes.
        </p>
        <button className="hero-cta mt-8 px-6 py-3 rounded-xl bg-white text-black">
          Get Started
        </button>
      </section>
    </>
  );
}