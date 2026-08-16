"use client";

// Synthesized send/receive cues (Web Audio API) — not a reproduction of any
// platform's proprietary sound assets, but built to match the actual shape
// of those cues rather than a generic "blip": send is a rising filtered-
// noise whoosh, receive is a fast-attack, bell-like two-note ding. Lazily
// created on first use so it only ever runs after a genuine user gesture
// (opening/sending in the chat), satisfying browser autoplay policies
// without needing an explicit "enable sound" step.
let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}

/**
 * A short burst of band-pass-filtered white noise swept upward in
 * frequency — an airy "whoosh" rather than a discrete musical tone.
 */
export function playSentSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 0.22;

  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.Q.value = 1.1;
  bandpass.frequency.setValueAtTime(500, now);
  bandpass.frequency.exponentialRampToValueAtTime(3400, now + duration * 0.85);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

  noise.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + duration + 0.02);
}

/**
 * Two quick, bright notes with a fast attack and short decay — a
 * percussive "ding-ding" rather than a soft chime.
 */
export function playReceivedSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [1318.5, 1567.98]; // E6, G6 — bright, bell-like interval

  notes.forEach((frequency, index) => {
    const start = now + index * 0.1;
    const end = start + 0.2;

    const fundamental = ctx.createOscillator();
    fundamental.type = "sine";
    fundamental.frequency.value = frequency;

    const overtone = ctx.createOscillator();
    overtone.type = "sine";
    overtone.frequency.value = frequency * 2;
    const overtoneGain = ctx.createGain();
    overtoneGain.gain.value = 0.18;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0008, end);

    fundamental.connect(gain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(ctx.destination);

    fundamental.start(start);
    fundamental.stop(end + 0.02);
    overtone.start(start);
    overtone.stop(end + 0.02);
  });
}
