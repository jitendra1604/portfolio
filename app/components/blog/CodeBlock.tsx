"use client";

import { useRef, useState, type ComponentPropsWithoutRef } from "react";

type CodeBlockProps = ComponentPropsWithoutRef<"pre"> & {
  "data-language"?: string;
};

/**
 * Wraps highlighted code with the two things a developer expects: the language
 * it is in, and a way to take it away. Highlighting itself happens at build
 * time (rehype-pretty-code), so this ships no parser to the browser.
 */
export default function CodeBlock({ children, ...props }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const language = props["data-language"];

  const copy = async () => {
    const code = preRef.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (insecure origin, denied permission) — leave
      // the label alone rather than claiming a copy that did not happen.
      setCopied(false);
    }
  };

  return (
    <div className="group relative my-6">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
        {language ? (
          <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[10.5px] uppercase tracking-[0.12em] text-caption">
            {language}
          </span>
        ) : null}
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Code copied" : "Copy code"}
          className="rounded-md border border-line bg-surface px-2 py-1 text-[10.5px] uppercase tracking-[0.12em] text-caption opacity-0 transition-opacity hover:border-line-strong hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        ref={preRef}
        {...props}
        // Overflowing code must be reachable without a mouse.
        tabIndex={0}
        className="overflow-x-auto rounded-xl border border-line bg-[#0d1117] p-4 text-[13.5px] leading-6"
      >
        {children}
      </pre>
    </div>
  );
}
