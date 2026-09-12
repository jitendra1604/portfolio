/**
 * A project's system flow drawn as a row of numbered nodes. It stands in for
 * a screenshot on the home cards: the site's argument is architecture over
 * polish, so the picture of a project is how requests move through it.
 *
 * Server-renderable — no state, no handlers.
 */
export default function FlowStrip({
  steps,
  compact = false,
}: {
  steps: string[];
  compact?: boolean;
}) {
  const nodes = steps.slice(0, 4);
  if (nodes.length === 0) return null;

  return (
    <ol
      aria-label="System flow"
      className={`grid gap-2 ${compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 md:grid-cols-4"}`}
    >
      {nodes.map((step, index) => (
        <li key={step} className="relative flex min-w-0 flex-col">
          <div className="flex h-full flex-col rounded-lg border border-line bg-black/30 px-3 py-2.5">
            <span className="text-[10px] font-medium tabular-nums tracking-[0.2em] text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={`mt-1 text-body ${compact ? "line-clamp-2 text-[11.5px] leading-4" : "line-clamp-3 text-xs leading-5"}`}
            >
              {step.replace(/\.$/, "")}
            </span>
          </div>
          {index < nodes.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute -right-[7px] top-1/2 z-10 hidden h-3 w-3 -translate-y-1/2 items-center justify-center text-caption sm:flex"
            >
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
