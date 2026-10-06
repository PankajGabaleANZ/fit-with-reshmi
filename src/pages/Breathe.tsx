import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Moon, Wind } from "lucide-react";
import Pacer, { type Protocol } from "../components/breathe/Pacer";
import BoltTimer from "../components/breathe/BoltTimer";
import { BTN_PRIMARY, BODY, CARD, CONTAINER, EYEBROW, H1, H2, SECTION } from "../components/home/ui";

// PLACEHOLDER (Unsplash, free licence): replace with a photo of Reshmi or a client practising breathwork
const HERO_IMAGE = "https://images.unsplash.com/photo-1741714294772-ba0bd2e07371?auto=format&fit=crop&w=2000&q=80";

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
      <section className="pt-[72px]">
        <div className="relative min-h-[520px] lg:min-h-[600px] flex items-end overflow-hidden bg-ink">
          <img src={HERO_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover object-[50%_35%]" />
          <div className="absolute inset-0 bg-[rgba(32,24,20,0.55)]" />
          <div className={`relative w-full ${CONTAINER} px-5 sm:px-8 lg:px-10 pb-16 lg:pb-20 pt-24`}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.02em] text-parchment/90">Breathwork</p>
            <h1 className={`${H1} !text-parchment mt-5`}>
              Breathe with <em>Reshmi</em>
            </h1>
            <p className="text-[17px] sm:text-[20px] font-light leading-[1.45] text-parchment/80 max-w-[560px] mt-7">
              Choose a rhythm, follow the ring and let your breath slow down. A few quiet minutes is enough.
            </p>
            <p className="text-[13px] text-parchment/65 mt-5 max-w-[560px]">
              Gentle general practice. If you are pregnant or have a heart, blood-pressure or respiratory condition, check with your doctor first.
            </p>
          </div>
        </div>
      </section>

      <Pacer protocols={protocols} />

      <section className={`${SECTION} bg-surface`}>
        <div className={CONTAINER}>
          <div className="max-w-[640px]">
            <p className={EYEBROW}>Why it helps</p>
            <h2 className={`${H2} mt-3`}>
              A few minutes <em>goes a long way</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mt-14">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className={`${CARD} !bg-card`}>
                <Icon size={28} strokeWidth={1.5} className="text-accent" aria-hidden="true" />
                <h3 className="font-serif text-[26px] leading-[1.15] text-ink mt-10">{title}</h3>
                <p className="text-[16px] leading-[1.5] text-muted mt-3">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BoltTimer />

      <section className={`${SECTION} bg-surface text-center`}>
        <div className="max-w-[720px] mx-auto">
          <h2 className={H2}>
            Want a plan built <em>around you</em>?
          </h2>
          <p className={`${BODY} mt-6`}>
            Breathwork works best alongside nutrition and lifestyle. A Health Clarity Session looks at your whole story and the right next step.
          </p>
          <button onClick={() => navigate("/booking")} className={`${BTN_PRIMARY} mt-9`}>
            Book a Health Clarity Session <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
