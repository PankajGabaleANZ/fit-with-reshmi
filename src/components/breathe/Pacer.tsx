import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { AmbientBreath } from "../../lib/ambient";
import { CONTAINER, SECTION, BTN_PRIMARY } from "../home/ui";

export interface Protocol {
  id: string;
  name: string;
  desc: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

type Phase = "inhale" | "holdIn" | "exhale" | "holdOut";
const LABEL: Record<Phase, string> = { inhale: "Inhale", holdIn: "Hold", exhale: "Exhale", holdOut: "Rest" };

export const cadenceOf = (p: Protocol) => [p.inhale, p.holdIn, p.exhale, p.holdOut].filter((n) => n > 0).join("-");

/** Guided breathing pacer for any in-hold-out-hold rhythm, with a glowing ring and soft ambient sound. */
export default function Pacer({ protocols }: { protocols: Protocol[] }) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const protocol = protocols[Math.min(selected, protocols.length - 1)];

  const steps = useMemo(
    () =>
      ([
        ["inhale", protocol.inhale],
        ["holdIn", protocol.holdIn],
        ["exhale", protocol.exhale],
        ["holdOut", protocol.holdOut],
      ] as [Phase, number][]).filter(([, s]) => s > 0),
    [protocol]
  );

  const [active, setActive] = useState(false);
  // One state object, updated purely, so the countdown is exact (also under React StrictMode)
  const [run, setRun] = useState({ step: 0, seconds: steps[0][1], cycles: 0 });
  const { step: stepIndex, seconds, cycles } = run;
  const [soundOn, setSoundOn] = useState(true);
  const ambience = useRef<AmbientBreath | null>(null);
  const getAmbience = () => (ambience.current ??= new AmbientBreath());

  const [phase, phaseSeconds] = steps[Math.min(stepIndex, steps.length - 1)];

  // Changing the rhythm starts fresh
  useEffect(() => {
    setActive(false);
    setRun({ step: 0, seconds: steps[0][1], cycles: 0 });
  }, [steps]);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setRun((r) => {
        if (r.seconds > 1) return { ...r, seconds: r.seconds - 1 };
        const next = r.step + 1;
        return next >= steps.length
          ? { step: 0, seconds: steps[0][1], cycles: r.cycles + 1 }
          : { step: next, seconds: steps[next][1], cycles: r.cycles };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [active, steps]);

  // The soundscape follows the breath (an empty-lungs rest sounds like the end of the exhale)
  useEffect(() => {
    if (!active || !soundOn) {
      ambience.current?.fadeOut();
      return;
    }
    getAmbience().setPhase(phase === "holdIn" ? "hold" : phase === "inhale" ? "inhale" : "exhale", phaseSeconds);
  }, [active, soundOn, phase, phaseSeconds]);

  useEffect(() => () => { ambience.current?.dispose(); ambience.current = null; }, []);

  const toggle = () => {
    if (!active && soundOn) getAmbience().unlock(); // must happen inside the click for browsers to allow audio
    setActive((a) => !a);
  };
  const reset = () => {
    setActive(false);
    setRun({ step: 0, seconds: steps[0][1], cycles: 0 });
  };
  const toggleSound = () => {
    if (!soundOn) getAmbience().unlock();
    setSoundOn((on) => !on);
  };

  const ring = !active
    ? { scale: [1, 1.03, 1], inner: [1, 1.05, 1], glow: [0.45, 0.6, 0.45], t: { duration: 6, repeat: Infinity, ease: "easeInOut" as const } }
    : phase === "inhale"
    ? { scale: [1, 1.14], inner: [1, 1.2], glow: [0.5, 1], t: { duration: phaseSeconds, ease: "easeInOut" as const } }
    : phase === "holdIn"
    ? { scale: [1.14, 1.155, 1.14], inner: [1.2, 1.22, 1.2], glow: [1, 0.85, 1], t: { duration: Math.max(2, phaseSeconds / 2), repeat: Infinity, ease: "easeInOut" as const } }
    : phase === "exhale"
    ? { scale: [1.14, 1], inner: [1.2, 1], glow: [1, 0.4], t: { duration: phaseSeconds, ease: "easeInOut" as const } }
    : { scale: [1, 1.01, 1], inner: [1, 1.015, 1], glow: [0.4, 0.45, 0.4], t: { duration: Math.max(2, phaseSeconds / 2), repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <section className="bg-canvas text-ink overflow-hidden">
      <div className={`${CONTAINER} ${SECTION} grid grid-cols-1 lg:grid-cols-2 gap-14 items-center`}>
        <div className="order-2 lg:order-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.02em] text-accent">Choose a rhythm</p>

          <div className="grid grid-cols-2 gap-3 mt-5" role="radiogroup" aria-label="Breathing rhythm">
            {protocols.map((p, i) => (
              <button
                key={p.id}
                role="radio"
                aria-checked={i === selected}
                onClick={() => setSelected(i)}
                className={`text-left rounded-[20px] border px-4 py-3.5 transition-colors cursor-pointer ${
                  i === selected ? "border-terracotta bg-surface" : "border-line hover:bg-surface"
                }`}
              >
                <span className="block font-serif text-[22px] leading-none tabular-nums">{cadenceOf(p)}</span>
                <span className="block text-[12px] text-muted mt-2 leading-snug">{p.name.replace(/\s*\(.*?\)\s*/g, " ").trim()}</span>
              </button>
            ))}
          </div>

          {protocol.desc && <p className="text-[15px] leading-relaxed text-muted mt-6 max-w-[460px]">{protocol.desc}</p>}

          <div className="flex flex-wrap items-center gap-3 mt-8">
            <button onClick={toggle} className={BTN_PRIMARY}>
              {active ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
              {active ? "Pause" : "Begin"}
            </button>
            <button
              onClick={reset}
              className="p-3.5 rounded-full border border-line text-ink hover:bg-surface transition-colors cursor-pointer"
              aria-label="Reset"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={toggleSound}
              aria-pressed={soundOn}
              className="inline-flex items-center gap-2 p-3.5 sm:px-4 rounded-full border border-line text-ink hover:bg-surface transition-colors cursor-pointer text-[15px] font-semibold"
            >
              {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span className="hidden sm:inline">{soundOn ? "Sound on" : "Sound off"}</span>
              <span className="sr-only sm:hidden">{soundOn ? "Sound on" : "Sound off"}</span>
            </button>
          </div>

          <p className="text-[12px] text-faint mt-5" aria-live="polite">
            {cycles} {cycles === 1 ? "round" : "rounds"} completed
          </p>
        </div>

        <div className="order-1 lg:order-2 flex items-center justify-center">
          <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] flex items-center justify-center">
            <motion.div
              aria-hidden="true"
              animate={{ scale: ring.scale, opacity: ring.glow }}
              transition={ring.t}
              className="absolute -inset-[10%] rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(176,90,54,0.22) 0%, rgba(176,90,54,0.08) 40%, rgba(212,166,142,0.14) 62%, transparent 72%)" }}
            />
            <motion.div aria-hidden="true" animate={{ scale: ring.scale }} transition={ring.t} className="absolute inset-0">
              <motion.svg viewBox="0 0 400 400" className="w-full h-full" animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 36, repeat: Infinity, ease: "linear" }}>
                <defs>
                  <linearGradient id="pacerGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#E8C2AA" />
                    <stop offset="0.42" stopColor="#B05A36" />
                    <stop offset="0.75" stopColor="#C98A68" />
                    <stop offset="1" stopColor="#D4A68E" />
                  </linearGradient>
                  <filter id="pacerBlur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="9" />
                  </filter>
                </defs>
                <circle cx="200" cy="200" r="172" fill="none" stroke="url(#pacerGrad)" strokeWidth="14" opacity="0.55" filter="url(#pacerBlur)" />
                <circle cx="200" cy="200" r="172" fill="none" stroke="url(#pacerGrad)" strokeWidth="1.5" />
              </motion.svg>
            </motion.div>
            <motion.div aria-hidden="true" animate={{ scale: ring.inner }} transition={ring.t} className="absolute inset-[6%]">
              <motion.svg viewBox="0 0 400 400" className="w-full h-full" animate={reduceMotion ? undefined : { rotate: -360 }} transition={{ duration: 52, repeat: Infinity, ease: "linear" }}>
                <defs>
                  <linearGradient id="pacerGrad2" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#D4A68E" />
                    <stop offset="0.5" stopColor="#B05A36" />
                    <stop offset="1" stopColor="#E8C2AA" />
                  </linearGradient>
                </defs>
                <ellipse cx="200" cy="200" rx="172" ry="163" fill="none" stroke="url(#pacerGrad2)" strokeWidth="1" opacity="0.6" />
              </motion.svg>
            </motion.div>

            <button
              onClick={toggle}
              aria-label={active ? "Pause breathing session" : "Start breathing session"}
              className="relative w-[58%] h-[58%] rounded-full flex flex-col items-center justify-center text-center select-none cursor-pointer"
            >
              <span className="text-[10px] sm:text-[11px] tracking-[0.02em] uppercase text-accent font-semibold">
                {active ? LABEL[phase] : "Ready"}
              </span>
              <span className="font-serif font-light text-[60px] sm:text-[80px] leading-none text-ink my-2 sm:my-3 tabular-nums">
                {active ? seconds : cadenceOf(protocol)}
              </span>
              <span className="text-[10px] tracking-[0.02em] uppercase text-faint">{active ? "Follow the ring" : "Tap to begin"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
