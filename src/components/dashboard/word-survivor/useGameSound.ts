import { useCallback, useRef } from "react";

type SoundKind =
  | "correct"
  | "wrong"
  | "defeat-enemy"
  | "game-over"
  | "victory"
  | "combo"
  | "boss-defeat"
  | "level-up"
  | "achievement"
  | "powerup"
  | "region-clear";

const FREQS: Record<SoundKind, number[]> = {
  correct: [660, 880],
  wrong: [180, 110],
  "defeat-enemy": [440, 660, 880],
  "game-over": [400, 300, 200, 120],
  victory: [523, 659, 784, 1046],
  combo: [784, 988, 1175],
  "boss-defeat": [392, 523, 659, 784, 988],
  "level-up": [523, 659, 784, 1046, 1318],
  achievement: [880, 1046, 1318],
  powerup: [740, 988],
  "region-clear": [392, 523, 659, 784, 988, 1318],
};

export const useGameSound = (muted: boolean) => {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return null;
      ctxRef.current = new Ctx();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (kind: SoundKind) => {
      if (muted) return;
      const ctx = getCtx();
      if (!ctx) return;
      const notes = FREQS[kind];
      const stepTime = 0.085;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = kind === "wrong" ? "sawtooth" : "sine";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * stepTime;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + stepTime * 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + stepTime);
      });
    },
    [muted, getCtx],
  );

  return play;
};
