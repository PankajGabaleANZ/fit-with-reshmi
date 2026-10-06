import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { motion } from "motion/react";
import { flattenQuestions, scoreAssessment } from "../../lib/assessment";
import { useAssessmentConfig, useContent } from "../../lib/useContent";
import { BTN_OUTLINE, BTN_PRIMARY, EYEBROW } from "./ui";

export interface AssessmentSummary {
  overall: number;
  domains: Record<string, number>;
}

function band(score: number) {
  if (score >= 75) return { label: "Strong foundation", tone: "text-agave" };
  if (score >= 50) return { label: "Some patterns worth exploring", tone: "text-accent" };
  return { label: "A key area to look at", tone: "text-terracotta" };
}

/** Health Resilience Assessment: 16 quick questions across four areas, ending in a personalised profile. */
export default function Assessment({
  onClose,
  onBook,
  onAskEva,
}: {
  onClose: () => void;
  onBook: () => void;
  onAskEva: (summary: string) => void;
}) {
  const cfg = useAssessmentConfig();
  const showEva = useContent().sections.eva;
  const ALL_QUESTIONS = useMemo(() => flattenQuestions(cfg), [cfg]);
  const DOMAIN_ORDER = cfg.domains.map((d) => d.key);
  const labelOf = (key: string) => cfg.domains.find((d) => d.key === key)?.label ?? key;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const done = answers.length === ALL_QUESTIONS.length;

  // Escape closes; lock page scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const answer = (points: number) => {
    setAnswers((a) => [...a.slice(0, step), points]);
    setStep((s) => Math.min(s + 1, ALL_QUESTIONS.length));
  };

  const back = () => {
    if (step === 0) return;
    setStep((s) => s - 1);
    setAnswers((a) => a.slice(0, step - 1));
  };

  const summary: AssessmentSummary | null = done ? scoreAssessment(cfg, answers) : null;

  // Save the result so Reshmi can see it in the admin area
  useEffect(() => {
    if (summary && done) {
      const clientEmail = localStorage.getItem("clientEmail") || "";
      fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overall: summary.overall,
          domains: summary.domains,
          answers,
          clientEmail,
        }),
      }).catch((e) => console.error("Could not save the assessment result:", e));
    }
  }, [done]);

  // Only areas below the "strong" threshold are called out
  const focusAreas = summary
    ? [...DOMAIN_ORDER].filter((d) => summary.domains[d] < 75).sort((a, b) => summary.domains[a] - summary.domains[b]).slice(0, 2)
    : [];
  const names = focusAreas.map((d) => labelOf(d));

  const q = ALL_QUESTIONS[Math.min(step, ALL_QUESTIONS.length - 1)];

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Health Resilience Assessment"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-canvas rounded-[24px] max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 shadow-[var(--shadow-float)] relative text-left"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          aria-label="Close assessment"
        >
          <X size={20} />
        </button>

        {!done ? (
          <div>
            <p className={EYEBROW}>
              {labelOf(q.domain)} · {step + 1} of {ALL_QUESTIONS.length}
            </p>
            <h3 className="font-serif text-[26px] sm:text-[30px] leading-[1.15] text-ink mt-4 mb-7 pr-8">{q.question}</h3>

            <div className="space-y-2.5 mb-8">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answer(opt.points)}
                  className="w-full text-left px-5 py-4 rounded-[20px] bg-surface hover:bg-terracotta hover:text-parchment transition-colors text-[15px] text-ink cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={back}
                disabled={step === 0}
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-muted hover:text-ink disabled:opacity-30 disabled:cursor-default cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div className="flex-1 bg-surface h-1 rounded-full overflow-hidden" aria-hidden="true">
                <div className="bg-terracotta h-full transition-all duration-300" style={{ width: `${(step / ALL_QUESTIONS.length) * 100}%` }} />
              </div>
            </div>
          </div>
        ) : (
          summary && (
            <div>
              <div className="w-12 h-12 rounded-full bg-surface text-accent flex items-center justify-center mb-5">
                <Check size={24} />
              </div>
              <p className={EYEBROW}>Your health profile</p>
              <h3 className="font-serif text-[34px] sm:text-[40px] leading-[1.1] text-ink mt-3">
                Here's what your answers <em>highlight</em>
              </h3>

              <div className="mt-7 space-y-5">
                {DOMAIN_ORDER.map((d) => (
                  <div key={d}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[14px] font-medium text-ink">{labelOf(d)}</span>
                      <span className={`text-[12px] font-semibold ${band(summary.domains[d]).tone}`}>
                        {band(summary.domains[d]).label}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-[2px] bg-terracotta" style={{ width: `${summary.domains[d]}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[15px] leading-relaxed text-muted mt-7">
                {names.length === 0 ? (
                  <>
                    Your answers point to a strong foundation across every area. A Health Clarity Session can help you fine-tune it and protect it as life changes.
                  </>
                ) : (
                  <>
                    The {names.length === 1 ? "area" : "areas"} that stand out most {names.length === 1 ? "is" : "are"}{" "}
                    {names.map((n, i) => (
                      <span key={n}>
                        {i > 0 && " and "}
                        <strong className="text-ink font-semibold">{n}</strong>
                      </span>
                    ))}
                    . These are patterns worth understanding in the context of your whole story, which is exactly what a Health Clarity Session is for.
                  </>
                )}
              </p>
              <p className="text-[12px] text-faint mt-4">
                This is an educational snapshot, not a diagnosis or medical advice.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button onClick={onBook} className={`${BTN_PRIMARY} sm:flex-1`}>
                  Book a Health Clarity Session
                </button>
                {showEva && (
                <button
                  onClick={() =>
                    onAskEva(
                      `I just completed the Health Resilience Assessment. My scores out of 100: ${DOMAIN_ORDER.map(
                        (d) => `${labelOf(d)} ${summary.domains[d]}`
                      ).join(", ")}. Can you explain what this means and what I could do next?`
                    )
                  }
                  className={`${BTN_OUTLINE} sm:flex-1`}
                >
                  Ask Eva about my results
                </button>
                )}
              </div>
            </div>
          )
        )}
      </motion.div>
    </div>
  );
}
