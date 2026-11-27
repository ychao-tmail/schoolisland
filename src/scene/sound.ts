export interface LearningSoundController {
  isEnabled: () => boolean;
  setEnabled: (on: boolean) => void;
  playStep: (onBridge: boolean) => void;
  playDiscover: () => void;
  playStamp: () => void;
  dispose: () => void;
}

export function createLearningSound(): LearningSoundController {
  let enabled = false;
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;

  function ensureContext(): AudioContext | null {
    if (!enabled) return null;
    if (!ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = 0.28;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playTone(freq: number, type: OscillatorType, delay: number, duration: number, volume: number) {
    const audio = ensureContext();
    if (!audio || !master) return;
    const t = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(Math.max(0.0001, volume), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  return {
    isEnabled: () => enabled,
    setEnabled(on: boolean) {
      enabled = on;
      if (on) ensureContext();
    },
    playStep(onBridge: boolean) {
      if (!enabled) return;
      playTone(onBridge ? 240 : 170, onBridge ? "triangle" : "sine", 0, 0.055, onBridge ? 0.14 : 0.09);
    },
    playDiscover() {
      if (!enabled) return;
      playTone(523.25, "triangle", 0, 0.16, 0.22);
      playTone(659.25, "triangle", 0.09, 0.22, 0.24);
    },
    playStamp() {
      if (!enabled) return;
      playTone(523.25, "sine", 0, 0.15, 0.22);
      playTone(659.25, "sine", 0.08, 0.15, 0.22);
      playTone(783.99, "sine", 0.16, 0.28, 0.26);
    },
    dispose() {
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
        master = null;
      }
    },
  };
}
