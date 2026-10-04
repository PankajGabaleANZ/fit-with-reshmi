import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Moon, Wind } from "lucide-react";
import Pacer, { type Protocol } from "../components/breathe/Pacer";
import BoltTimer from "../components/breathe/BoltTimer";
import { BODY, BTN_PRIMARY, CONTAINER, EYEBROW, H2, SECTION } from "../components/home/ui";

const FALLBACK: Protocol[] = [
  { id: "478", name: "Rest & Relieve (4-7-8)", desc: "A long, slow breath out helps the body settle. Good before sleep or when you feel wound up.", inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
  { id: "box", name: "Box Breathing", desc: "Equal sides, steady and focusing. Useful before something stressful.", inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  { id: "coherent", name: "Coherent Breathing", desc: "An even, easy rhythm of about six breaths a minute for steady calm.", inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 },
  { id: "energizer", name: "Quick Energiser", desc: "Short, brisk breaths for an afternoon lift.", inhale: 2, holdIn: 1, exhale: 2, holdOut: 1 },
];

const BENEFITS = [
  { icon: Wind, title: "Calms the body", desc: "Slow breathing with a longer breath out tells your nervous system it is safe to settle." },
  { icon: Moon, title: "Helps you wind down", desc: "A few minutes in the evening can make it easier to switch off and fall asleep." },
  { icon: Heart, title: "Builds resilience", desc: "Practised daily, it becomes a tool you can reach for whenever stress rises." },
];

/** Simple breathing page: pick a rhythm, follow the ring, optionally check your BOLT score. */
export default function Breathe() {
  const navigate = useNavigate();
  const [protocols, setProtocols] = useState<Protocol[]>(FALLBACK);

  useEffect(() => {
    fetch("/api/breath/protocols")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const list: Protocol[] = (d.protocols || []).filter((p: any) => p?.name && Number(p.inhale) > 0 && Number(p.exhale) > 0);
        if (list.length) setProtocols(list.map((p: any) => ({ ...p, inhale: Number(p.inhale), holdIn: Number(p.holdIn) || 0, exhale: Number(p.exhale), holdOut: Number(p.holdOut) || 0 })));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-canvas text-ink min-h-screen selection:bg-terracotta selection:text-white">
      <section className={`${SECTION} pt-[140px] md:pt-[170px] text-center`}>
        <div className="max-w-[720px] mx-auto">
          <p className={EYEBROW}>Breathwork</p>
          <h1 className="font-serif font-light text-[44px] sm:text-[64px] lg:text-[76px] leading-[1.05] tracking-tight text-ink mt-5">
            Breathe with <em>Reshmi</em>
          </h1>
          <p className={`${BODY} mt-7`}>
            Choose a rhythm, follow the ring and let your breath slow down. A few quiet minutes is enough.
          </p>
          <p className="text-[12px] text-faint mt-5">
            Gentle general practice. If you are pregnant or have a heart, blood-pressure or respiratory condition, check with your doctor first.
          </p>
        </div>
      </section>

      <Pacer protocols={protocols} />

      <section className={SECTION}>
        <div className={CONTAINER}>
          <div className="text-center max-w-[640px] mx-auto">
            <h2 className={H2}>
              Why a few minutes <em>helps</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mt-12">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-surface border border-line rounded-xl p-8">
                <Icon size={28} strokeWidth={1.25} className="text-ink" aria-hidden="true" />
                <h3 className="font-serif font-normal text-[22px] text-ink mt-7">{title}</h3>
                <p className="text-[14px] leading-relaxed text-muted mt-3">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BoltTimer />

      <section className={`${SECTION} text-center`}>
        <div className="max-w-[720px] mx-auto">
          <h2 className={H2}>
            Want a plan built <em>around you</em>?
          </h2>
          <p className={`${BODY} mt-6`}>
            Breathwork works best alongside nutrition and lifestyle. A Health Clarity Session looks at your whole story and the right next step.
          </p>
          <button onClick={() => navigate("/booking")} className={`${BTN_PRIMARY} mt-9`}>
            Book a Health Clarity Session <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
