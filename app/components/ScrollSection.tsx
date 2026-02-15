"use client";

import gsap from "@/lib/gsap";
import { useGsap } from "@/hooks/useGsap";

export default function ScrollSection() {
  const {scope} = useGsap((ctx) => {
    gsap.from(".card", {
      scrollTrigger: {
        trigger: ".card",
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
      y: 60,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      ease: "power2.out",
    });
  }, []);

  return (
    <section ref={scope} className="py-32 bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-6 bg-gray-900 rounded-xl">
            Card {i + 1}
          </div>
        ))}
      </div>
    </section>
  );
}