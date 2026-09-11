import type { TocEntry } from "./TableOfContents";

/**
 * Collapsed section list for widths where the sticky rail is hidden. Most
 * readers arrive on a phone, and until now they had no way to see a post's
 * shape or jump into it.
 */
export default function MobileToc({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 3) return null;

  return (
    <details className="mt-10 rounded-xl border border-line bg-surface xl:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[11.5px] uppercase tracking-[0.18em] text-caption [&::-webkit-details-marker]:hidden">
        On this page
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 transition-transform [details[open]_&]:rotate-180">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <ol className="list-none border-t border-line px-5 py-3 pl-5">
        {entries.map((entry) => (
          <li key={entry.id} className="pl-0">
            <a
              href={`#${entry.id}`}
              className={`block py-1.5 text-[14.5px] leading-6 text-caption transition-colors hover:text-ink ${
                entry.level === 3 ? "pl-4" : ""
              }`}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
