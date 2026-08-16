"use client";

// Short, synthesized send/receive tones (Web Audio API) — not a reproduction
// of any platform's proprietary sound assets, just a similarly light "blip"
// feel. Lazily created on first use so it only ever runs after a genuine
// user gesture (opening/sending in the chat), satisfying browser autoplay
// policies without needing an explicit "enable sound" step.
let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}

function playTones(frequencies: number[], toneDurationMs: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  frequencies.forEach((frequency, index) => {
    const start = now + index * (toneDurationMs / 1000) * 0.6;
    const end = start + toneDurationMs / 1000;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.15, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, end);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  });
}

/** Quick upward two-tone blip — plays when the local user sends a message. */
export function playSentSound() {
  playTones([700, 1000], 90);
}

/** Two-tone descending chime — plays when a message arrives from the other side. */
export function playReceivedSound() {
  playTones([1000, 750], 110);
}
