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
    <div className="group my-6 overflow-hidden rounded-xl border border-line bg-[#0d1117]">
      {/* The label and copy button used to float over the code, and covered
          the end of any first line longer than ~70 characters. A header strip
          keeps them out of the code's way. */}
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
        <span className="text-[10.5px] uppercase tracking-[0.12em] text-caption">
          {language ?? "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Code copied" : "Copy code"}
          className="rounded-md border border-line bg-surface px-2 py-1 text-[10.5px] uppercase tracking-[0.12em] text-caption transition-colors hover:border-line-strong hover:text-ink"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        ref={preRef}
        {...props}
        // Overflowing code must be reachable without a mouse.
        tabIndex={0}
        className="overflow-x-auto p-4 text-[13.5px] leading-6"
      >
        {children}
      </pre>
    </div>
  );
}
