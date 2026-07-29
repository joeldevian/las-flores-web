/**
 * Web Audio API Chime Synthesizer for Kitchen & Cashier Realtime Alerts
 * Plays a pleasant, crisp 2-tone restaurant order bell chime (880Hz -> 587Hz)
 * Works in all modern browsers without needing external audio file assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playOrderChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Tone 1: High Chime (880 Hz - A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.6);

    // Tone 2: Warm Chime (587.33 Hz - D5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(587.33, now + 0.18);
    gain2.gain.setValueAtTime(0.5, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.18);
    osc2.stop(now + 0.9);
  } catch (err) {
    console.warn("Could not play order chime:", err);
  }
}
