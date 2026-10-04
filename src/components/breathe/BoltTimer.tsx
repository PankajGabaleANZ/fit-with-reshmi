import { useEffect, useRef, useState } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { BODY, BTN_DARK, BTN_OUTLINE, CONTAINER, EYEBROW, H2, SECTION } from "../home/ui";

function band(s: number) {
  if (s >= 30) return { label: "Excellent", note: "A strong, relaxed breathing pattern. Keep nasal breathing and daily practice going." };
  if (s >= 20) return { label: "Good", note: "A comfortable tolerance. Slow, nasal breathing practice can build on this." };
  if (s >= 10) return { label: "Room to grow", note: "Common when life is busy or stressful. Gentle daily breathing practice usually helps." };
  return { label: "Just starting out", note: "Very common as a first score. Short, calm practice each day is a good place to begin." };
}

/** A simple BOLT (Body Oxygen Level Test) stopwatch. Educational only, not a medical test. */
export default function BoltTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((Date.now() - startedAt.current) / 1000), 100);
    return () => clearInterval(t);
  }, [running]);

  const start = () => {
    startedAt.current = Date.now();
    setElapsed(0);
    setResult(null);
    setRunning(true);
  };
  const stop = () => {
    const s = (Date.now() - startedAt.current) / 1000;
    setRunning(false);
    setElapsed(s);
    setResult(Math.round(s * 10) / 10);
  };
  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setResult(null);
  };

  // Spacebar starts/stops on desktop (unless the person is typing or pressing a button)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.code !== "Space" || tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "SELECT") return;
      e.preventDefault();
      running ? stop() : start();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running]);

  const b = result !== null ? band(result) : null;

  return (
    <section id="bolt" className={`${SECTION} bg-surface`}>
      <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center`}>
        <div>
          <p className={EYEBROW}>Your BOLT score</p>
          <h2 className={`${H2} mt-4`}>
            How calm is <em>your breath</em>?
          </h2>
          <p className={`${BODY} mt-6 max-w-[480px]`}>
            The BOLT test times how long you can comfortably pause after a normal breath out. It is a simple snapshot of your breathing, not a medical test.
          </p>
          <ol className="mt-7 space-y-3 text-[15px] text-muted max-w-[480px]">
            {[
              "Sit still and breathe normally through your nose for a minute.",
              "Breathe in, then out, normally. Pinch your nose and press Start.",
              "Stop at the first clear urge to breathe, then breathe in calmly through your nose.",
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-serif text-accent text-[18px] leading-snug w-5 shrink-0">{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
          <p className="text-[12px] text-faint mt-6 max-w-[480px]">
            If you feel dizzy or unwell, stop and breathe normally. Check with your doctor first if you are pregnant or have a heart, blood-pressure or respiratory condition.
          </p>
        </div>

        <div className="bg-card border border-line rounded-2xl p-8 sm:p-10 text-center">
          <p className="font-serif font-light text-[84px] sm:text-[104px] leading-none text-ink tabular-nums" aria-live="off">
            {elapsed.toFixed(1)}
            <span className="text-[28px] text-faint ml-1">s</span>
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            {running ? (
              <button onClick={stop} className={BTN_DARK}>
                <Square size={13} className="fill-current" /> Stop
              </button>
            ) : (
              <button onClick={start} className={BTN_DARK}>
                <Play size={13} className="fill-current" /> {result !== null ? "Try again" : "Start"}
              </button>
            )}
            {(result !== null || elapsed > 0) && !running && (
              <button onClick={reset} className={BTN_OUTLINE} aria-label="Clear">
                <RotateCcw size={13} />
              </button>
            )}
          </div>
          <p className="text-[12px] text-faint mt-4">You can also tap the spacebar to start and stop.</p>

          {b && (
            <div className="mt-8 pt-6 border-t border-line" aria-live="polite">
              <p className="font-serif text-[24px] text-ink">{b.label}</p>
              <p className="text-[14px] leading-relaxed text-muted mt-2">{b.note}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
