type ScanSoundKind = "allowed" | "invalid" | "duplicate";

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) {
    try {
      audioContext = new AudioContextClass();
    } catch {
      return null;
    }
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume().catch(() => {});
  }
  return audioContext;
}

function tone(
  context: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  type: OscillatorType,
  volume: number,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now + startAt);
  gain.gain.setValueAtTime(0.0001, now + startAt);
  gain.gain.exponentialRampToValueAtTime(volume, now + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + startAt + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now + startAt);
  oscillator.stop(now + startAt + duration + 0.05);
}

export function playScanSound(kind: ScanSoundKind): void {
  const context = getContext();
  if (!context) return;
  try {
    if (kind === "allowed") {
      tone(context, 659.25, 0, 0.14, "sine", 0.28);
      tone(context, 987.77, 0.16, 0.22, "sine", 0.28);
    } else if (kind === "duplicate") {
      tone(context, 440, 0, 0.12, "square", 0.16);
      tone(context, 440, 0.18, 0.12, "square", 0.16);
      tone(context, 330, 0.36, 0.2, "square", 0.16);
    } else {
      tone(context, 196, 0, 0.3, "sawtooth", 0.22);
      tone(context, 147, 0.34, 0.4, "sawtooth", 0.22);
    }
  } catch {
    // Sound is non-critical; never let it break scanning.
  }
}
