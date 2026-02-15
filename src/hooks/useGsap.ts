// /hooks/useGsap.ts
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
type GSAP = typeof gsap;

export function useGsap(
  callback: (gsap: GSAP, scope: HTMLElement) => void,
  deps: any[] = []
) {
  const scope = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

useLayoutEffect(() => {
  if (!scope.current) return;

  const ctx = gsap.context(() => {
    callback(gsap, scope.current!);
    ScrollTrigger.refresh();
    setReady(true);
  }, scope.current);

  return () => ctx.revert();
}, deps);

  return { scope, ready };
}