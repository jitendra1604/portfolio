"use client";

import dynamic from "next/dynamic";

const Hero = dynamic(() => import("./Hero"), {
  ssr: false,
  loading: () => null,
});

export default function HeroClient() {
  return <Hero />;
}