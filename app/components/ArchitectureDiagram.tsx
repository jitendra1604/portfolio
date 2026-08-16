"use client";

import { useRef, useState } from "react";

export default function ArchitectureDiagram({ decisions }: { decisions: string[] }) {
  const layers = ["Client", "Frontend", "Backend API", "Data & services"];
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (index: number) => {
    const next = (index + layers.length) % layers.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") focusTab(active + 1);
    else if (event.key === "ArrowLeft") focusTab(active - 1);
    else return;
    event.preventDefault();
  };

  return <div className="mt-4"><div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Architecture layers" onKeyDown={onKeyDown}>{layers.map((layer, index) => <div key={layer} className="flex items-center gap-2"><button type="button" role="tab" ref={(el) => { tabRefs.current[index] = el; }} tabIndex={index === active ? 0 : -1} aria-selected={index === active} onClick={() => setActive(index)} className={`rounded-full border px-3 py-2 text-xs font-medium ${index === active ? "border-accent bg-accent/10 text-ink" : "border-line-strong text-body hover:border-accent"}`}>{layer}</button>{index < layers.length - 1 && <span aria-hidden="true" className="text-caption">→</span>}</div>)}</div><p className="mt-4 rounded-lg border border-line bg-black/20 p-4 text-sm leading-7 text-body">{decisions[active % decisions.length]}</p></div>;
}
