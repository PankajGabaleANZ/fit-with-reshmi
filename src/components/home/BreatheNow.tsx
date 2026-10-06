import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, RotateCcw, Volume2, VolumeX, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { AmbientBreath } from "../../lib/ambient";
import { CONTAINER, SECTION, BTN_PRIMARY, H2, BODY } from "./ui";

type Phase = "inhale" | "hold" | "exhale";
const PHASE_SECONDS: Record<Phase, number> = { inhale: 4, hold: 7, exhale: 8 };

/** Guided 4-7-8 pacer on parchment: glowing terracotta ring + ambient soundscape. */
export default function BreatheNow() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [seconds, setSeconds] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const ambience = useRef<AmbientBreath | null>(null);
  const getAmbience = () => (ambience.current ??= new AmbientBreath());

  // 4-7-8 timer
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 1) return prev - 1;
        if (phase === "inhale") { setPhase("hold"); return 7; }
        if (phase === "hold") { setPhase("exhale"); return 8; }
        setPhase("inhale");
        setCycles((c) => c + 1);
        return 4;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [active, phase]);

  // Soundscape follows the breath
  useEffect(() => {
    if (!active || !soundOn) {
      ambience.current?.fadeOut();
      return;
    }
    getAmbience().setPhase(phase, PHASE_SECONDS[phase]);
  }, [active, phase, soundOn]);

  useEffect(() => () => { ambience.current?.dispose(); ambience.current = null; }, []);

  const toggle = () => {
    if (!active) {
      if (soundOn) getAmbience().unlock(); // must happen inside the click for browsers to allow audio
      setActive(true);
      setPhase("inhale");
      setSeconds(4);
    } else {
      setActive(false);
    }
  };

  const reset = () => {
    setActive(false);
    setPhase("inhale");
    setSeconds(4);
    setCycles(0);
  };

  const toggleSound = () => {
    if (!soundOn) getAmbience().unlock();
    setSoundOn((on) => !on);
  };

  // Grows over the 4s inhale, gently shimmers through the 7s hold, settles over the 8s exhale
  const ring = !active
    ? { scale: [1, 1.03, 1], innerScale: [1, 1.05, 1], glow: [0.45, 0.6, 0.45], transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const } }
    : phase === "inhale"
    ? { scale: [1, 1.14], innerScale: [1, 1.2], glow: [0.5, 1], transition: { duration: 4, ease: "easeInOut" as const } }
    : phase === "hold"
    ? { scale: [1.14, 1.155, 1.14], innerScale: [1.2, 1.22, 1.2], glow: [1, 0.85, 1], transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" as const } }
    : { scale: [1.14, 1], innerScale: [1.2, 1], glow: [1, 0.4], transition: { duration: 8, ease: "easeInOut" as const } };

  return (
    <section id="breathe-now" className="bg-canvas text-ink overflow-hidden">
      <div className={`${CONTAINER} ${SECTION} grid grid-cols-1 lg:grid-cols-2 gap-14 items-center`}>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.02em] text-accent">Try it now</p>
          <h2 className={`${H2} mt-3`}>
            Breathe <em>now</em>.
          </h2>
          <p className={`${BODY} max-w-[460px] mt-6`}>
            A guided 4-7-8 rhythm: four seconds in, seven held, eight out, with a soft ambient soundscape to help you settle in a few minutes, wherever you are.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-9">
            <button onClick={toggle} className={BTN_PRIMARY}>
              {active ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
              {active ? "Pause session" : "Breathe now"}
            </button>
            <button
              onClick={reset}
              className="p-3.5 rounded-full border border-line text-ink hover:bg-surface transition-colors cursor-pointer"
              aria-label="Reset counter"
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
            {cycles} {cycles === 1 ? "cycle" : "cycles"} completed
          </p>

          <Link
            to="/breathe"
            className="inline-flex items-center gap-2 mt-6 text-[15px] font-semibold text-accent hover:text-ink transition-colors no-underline"
          >
            More breathing rhythms <ArrowRight size={14} />
          </Link>
          <p className="text-[11px] text-faint mt-6 max-w-[460px]">
            Gentle breathing practice for general wellbeing. If you're pregnant or have a heart, blood-pressure or respiratory condition, check with your doctor first.
          </p>
        </div>

        {/* Glowing organic ring */}
        <div className="flex items-center justify-center">
          <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] flex items-center justify-center">
            <motion.div
              aria-hidden="true"
              animate={{ scale: ring.scale, opacity: ring.glow }}
              transition={ring.transition}
              className="absolute -inset-[10%] rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(176,90,54,0.22) 0%, rgba(176,90,54,0.08) 40%, rgba(212,166,142,0.14) 62%, transparent 72%)",
              }}
            />

            <motion.div aria-hidden="true" animate={{ scale: ring.scale }} transition={ring.transition} className="absolute inset-0">
              <motion.svg
                viewBox="0 0 400 400"
                className="w-full h-full"
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
              >
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#E8C2AA" />
                    <stop offset="0.42" stopColor="#B05A36" />
                    <stop offset="0.75" stopColor="#C98A68" />
                    <stop offset="1" stopColor="#D4A68E" />
                  </linearGradient>
                  <filter id="ringBlur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="9" />
                  </filter>
                </defs>
                <circle cx="200" cy="200" r="172" fill="none" stroke="url(#ringGrad)" strokeWidth="14" opacity="0.55" filter="url(#ringBlur)" />
                <circle cx="200" cy="200" r="172" fill="none" stroke="url(#ringGrad)" strokeWidth="1.5" />
              </motion.svg>
            </motion.div>

            <motion.div aria-hidden="true" animate={{ scale: ring.innerScale }} transition={ring.transition} className="absolute inset-[6%]">
              <motion.svg
                viewBox="0 0 400 400"
                className="w-full h-full"
                animate={reduceMotion ? undefined : { rotate: -360 }}
                transition={{ duration: 52, repeat: Infinity, ease: "linear" }}
              >
                <defs>
                  <linearGradient id="ringGrad2" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#D4A68E" />
                    <stop offset="0.5" stopColor="#B05A36" />
                    <stop offset="1" stopColor="#E8C2AA" />
                  </linearGradient>
                </defs>
                <ellipse cx="200" cy="200" rx="172" ry="163" fill="none" stroke="url(#ringGrad2)" strokeWidth="1" opacity="0.6" />
              </motion.svg>
            </motion.div>

            <button
              onClick={toggle}
              aria-label={active ? "Pause breathing session" : "Start breathing session"}
              className="relative w-[58%] h-[58%] rounded-full flex flex-col items-center justify-center text-center select-none cursor-pointer"
            >
              <span className="text-[10px] sm:text-[11px] tracking-[0.02em] uppercase text-accent font-semibold">
                {active ? (phase === "inhale" ? "Inhale" : phase === "hold" ? "Hold" : "Exhale") : "4-7-8 breathing"}
              </span>
              <span className="font-serif font-light text-[60px] sm:text-[80px] leading-none text-ink my-2 sm:my-3 tabular-nums">
                {active ? seconds : "4-7-8"}
              </span>
              <span className="text-[10px] tracking-[0.02em] uppercase text-faint">
                {active ? "Breathe with the ring" : "Tap to begin"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
