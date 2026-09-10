"use client";

import { useEffect, useState } from "react";

/**
 * Thin progress bar pinned under the header. Long-form posts run to several
 * screens, and there was no indication of how much was left.
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable <= 0 ? 0 : Math.min(1, window.scrollY / scrollable));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    // Pinned to the viewport edge rather than under the header: the header
    // hides on scroll down, which left the bar floating over the text.
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[60] h-0.5 bg-transparent"
    >
      <div
        className="h-full origin-left bg-accent transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
