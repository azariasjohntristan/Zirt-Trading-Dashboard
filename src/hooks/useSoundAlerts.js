import { useCallback, useRef } from "react";

const audioCtxRef = { current: null };

function getAudioContext() {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtxRef.current;
}

function playTone(frequency, duration, type = "sine", volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export function useSoundAlerts(enabled = true) {
  const lastBiasDate = useRef(null);

  const playBiasAlert = useCallback(() => {
    if (!enabled) return;
    playTone(880, 0.15, "sine", 0.25);
    setTimeout(() => playTone(1100, 0.2, "sine", 0.2), 150);
  }, [enabled]);

  const playValidationSound = useCallback(() => {
    if (!enabled) return;
    playTone(523, 0.1, "square", 0.15);
    setTimeout(() => playTone(659, 0.1, "square", 0.12), 100);
    setTimeout(() => playTone(784, 0.15, "square", 0.1), 200);
  }, [enabled]);

  const playWinSound = useCallback(() => {
    if (!enabled) return;
    playTone(523, 0.12, "sine", 0.2);
    setTimeout(() => playTone(659, 0.12, "sine", 0.18), 120);
    setTimeout(() => playTone(784, 0.12, "sine", 0.16), 240);
    setTimeout(() => playTone(1047, 0.2, "sine", 0.14), 360);
  }, [enabled]);

  const playLossSound = useCallback(() => {
    if (!enabled) return;
    playTone(440, 0.2, "sawtooth", 0.1);
    setTimeout(() => playTone(330, 0.3, "sawtooth", 0.08), 200);
  }, [enabled]);

  const checkBiasUpdate = useCallback(
    (biasDate) => {
      if (!enabled || !biasDate) return;
      if (lastBiasDate.current !== null && lastBiasDate.current !== biasDate) {
        playBiasAlert();
      }
      lastBiasDate.current = biasDate;
    },
    [enabled, playBiasAlert]
  );

  return { playBiasAlert, playValidationSound, playWinSound, playLossSound, checkBiasUpdate };
}
