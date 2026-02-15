"use client";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white">
      <div className="text-xl tracking-widest animate-pulse">Loading…</div>
    </div>
  );
}