import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { INSTAGRAM_REELS } from "../lib/data";
import {
  Activity, Play, Pause, RotateCcw, ChevronLeft, ChevronRight,
  ArrowRight, Check, X, Dna, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// PLACEHOLDER hero image — swap this for a warm, wide portrait of Reshmi.
// Keep the left ~45% of the photo calm: the headline sits over it.
const HERO_IMAGE = "/hero-placeholder.svg";

// Shared layout + type tokens (from the design spec sheet)
const CONTAINER = "max-w-[1280px] mx-auto";
const SECTION = "px-5 sm:px-8 py-[60px] md:py-[90px] lg:py-[120px]";
const EYEBROW = "text-[11px] font-semibold tracking-[0.22em] uppercase text-accent";
const H2 = "font-serif font-light text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.1] tracking-tight text-ink";
const BODY = "text-[16px] sm:text-[17px] leading-relaxed text-muted";
const BTN = "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md text-[12px] font-semibold tracking-[0.12em] uppercase transition-colors cursor-pointer";
const BTN_PRIMARY = `${BTN} bg-terracotta text-white hover:bg-[#C27354]`;
const BTN_OUTLINE = `${BTN} border border-ink text-ink hover:bg-ink hover:text-canvas`;
const BTN_DARK = `${BTN} bg-ink text-canvas hover:opacity-90`;

// Assessment Data for the Diagnostic Audit Hub
interface AuditQuestion {
  question: string;
  options: { label: string; points: number }[];
}

const AUDIT_QUESTIONS: Record<string, { title: string; subtitle: string; questions: AuditQuestion[] }> = {
  gut: {
    title: "Gut & Metabolic Flexibility Assessment",
    subtitle: "Evaluating intestinal mucosal barrier, blood-sugar kinetics & digestive vitality",
    questions: [
      {
        question: "How frequently do you experience post-meal lethargy or brain fog within 90 minutes?",
        options: [
          { label: "Rarely / Sustained clean energy throughout", points: 25 },
          { label: "Occasionally with heavy carbohydrate meals", points: 18 },
          { label: "Daily afternoon energy crashes (requires caffeine)", points: 8 },
          { label: "Severe fatigue after almost every meal", points: 2 }
        ]
      },
      {
        question: "Do you experience noticeable abdominal bloating or digestive distension by evening?",
        options: [
          { label: "Flat stomach, effortless digestion 24/7", points: 25 },
          { label: "Mild puffiness after high-stress days only", points: 18 },
          { label: "Consistent bloating by 5:00 PM regardless of food", points: 10 },
          { label: "Chronic discomfort, cramps, or irregular motility", points: 4 }
        ]
      },
      {
        question: "How steady is your fasting appetite between meals (e.g. 4-5 hours without snacking)?",
        options: [
          { label: "Metabolically flexible: easily fast without hunger shakes", points: 25 },
          { label: "Comfortable, slight hunger signals at meal times", points: 19 },
          { label: "Frequent 'hangry' spikes, shaky hands, or irritability", points: 9 },
          { label: "Constant sugar/carb cravings every 2 hours", points: 3 }
        ]
      },
      {
        question: "Have you had your fasting insulin, hs-CRP, or HbA1c checked recently?",
        options: [
          { label: "Yes, optimized (Fasting insulin <5 µIU/mL, hs-CRP <0.5)", points: 25 },
          { label: "Standard 'normal' ranges on routine labs", points: 17 },
          { label: "Elevated borderline markers or never tested", points: 8 },
          { label: "History of insulin resistance, PCOS, or fatty liver", points: 3 }
        ]
      }
    ]
  },
  bolt: {
    title: "BOLT Score & Vagus Nerve Assessment",
    subtitle: "Evaluating CO₂ tolerance, parasympathetic resilience & breathing efficiency",
    questions: [
      {
        question: "What is your approximate Body Oxygen Level Test (BOLT) comfortable breath-hold time?",
        options: [
          { label: "Over 35 seconds (Elite autonomic stability)", points: 25 },
          { label: "25–35 seconds (Healthy functional breathing)", points: 19 },
          { label: "15–24 seconds (Moderate hyperventilation / sympathetic tilt)", points: 10 },
          { label: "Under 15 seconds (Chronic autonomic stress pattern)", points: 4 }
        ]
      },
      {
        question: "Do you catch yourself breathing through your mouth during sleep, exercise, or work focus?",
        options: [
          { label: "100% nasal breathing 24/7 (including sleep)", points: 25 },
          { label: "Nasal during the day, occasionally mouth at night", points: 18 },
          { label: "Frequent mouth-breathing during stress or sleep (wake dry)", points: 9 },
          { label: "Chronic mouth breathing, snoring, or frequent sighing", points: 3 }
        ]
      },
      {
        question: "How rapidly does your resting heart rate recover after an acute stressful episode?",
        options: [
          { label: "Quickly restores to calm baseline within 2 minutes", points: 25 },
          { label: "Takes 5–10 minutes with deliberate slow exhales", points: 18 },
          { label: "Lingering racing pulse, chest tightness, or racing thoughts", points: 9 },
          { label: "Constant elevated baseline tension / low HRV", points: 4 }
        ]
      },
      {
        question: "How refreshed do you feel upon waking in the morning?",
        options: [
          { label: "Deeply restored, jump out of bed alert without alarm", points: 25 },
          { label: "Reasonably rested after 10 minutes of moving", points: 18 },
          { label: "Groovy, unrefreshed, takes 2+ coffees to start engine", points: 8 },
          { label: "Exhausted, wired-and-tired cycle, unrefreshing sleep", points: 2 }
        ]
      }
    ]
  },
  hormone: {
    title: "Hormonal & Lifestyle Restoration Assessment",
    subtitle: "Evaluating thyroid sensitivity, cortisol rhythm & circadian alignment",
    questions: [
      {
        question: "How would you describe your natural energy curve throughout a 24-hour cycle?",
        options: [
          { label: "Steady morning alertness, peak mid-day, gentle twilight drop", points: 25 },
          { label: "Moderate morning lull, strong afternoon productivity", points: 18 },
          { label: "Morning exhaustion followed by 10:00 PM 'second wind'", points: 8 },
          { label: "Completely inverted: fatigued all day, cannot sleep at night", points: 3 }
        ]
      },
      {
        question: "Do you experience persistent cold extremities, hair thinning, or dry skin?",
        options: [
          { label: "None: warm extremities, radiant skin, strong hair", points: 25 },
          { label: "Mild cold hands during winter months only", points: 19 },
          { label: "Chronic cold hands/feet and sluggish bowel motility", points: 9 },
          { label: "Classic subclinical hypothyroid symptoms", points: 3 }
        ]
      },
      {
        question: "For women: How predictable and symptom-free is your monthly menstrual cycle?",
        options: [
          { label: "Clockwork 28-30 days, minimal PMS, easy flow", points: 25 },
          { label: "Slight breast tenderness or mild cramping on Day 1", points: 19 },
          { label: "Noticeable mood volatility, heavy clotting, or irregular dates", points: 9 },
          { label: "Severe dysmenorrhea, PCOS, amenorrhea, or perimenopause surges", points: 4 }
        ]
      },
      {
        question: "How resilient is your emotional tolerance to unexpected daily obstacles?",
        options: [
          { label: "Calm, grounded, respond from thoughtful poise", points: 25 },
          { label: "Brief annoyance but reset within minutes", points: 18 },
          { label: "Easily overwhelmed, short-tempered, feeling at capacity", points: 8 },
          { label: "Constant high anxiety or burnout paralysis", points: 2 }
        ]
      }
    ]
  },
  sleep: {
    title: "Sleep Architecture & Airway Resilience (STOP-BANG)",
    subtitle: "Evaluating nocturnal oxygen saturation, snoring risk & upper airway resistance",
    questions: [
      {
        question: "Do you snore loudly or has anyone observed you stop breathing/gasping in sleep?",
        options: [
          { label: "Silent, smooth nasal breathing 100% of the night", points: 25 },
          { label: "Occasional mild snoring when overtired or congested", points: 18 },
          { label: "Regular audible snoring heard across the room", points: 8 },
          { label: "Observed choking/gasping episodes or waking with a gasp", points: 2 }
        ]
      },
      {
        question: "Do you experience persistent morning dry mouth, headache, or midday grogginess?",
        options: [
          { label: "Never: wake up clear-headed with moist palate", points: 25 },
          { label: "Rarely, only during seasonal allergic congestion", points: 18 },
          { label: "Frequent dry mouth or heavy eyes around 2:00 PM", points: 9 },
          { label: "Severe daily brain fog, morning headache, and drowsy driving", points: 3 }
        ]
      },
      {
        question: "Have you been diagnosed with or treated for high blood pressure?",
        options: [
          { label: "Optimal blood pressure (<115/75 mmHg)", points: 25 },
          { label: "Normal borderline (120/80 mmHg)", points: 18 },
          { label: "Stage 1 hypertension or taking medication", points: 9 },
          { label: "Uncontrolled hypertension with sleep disruption", points: 3 }
        ]
      },
      {
        question: "What is your typical sleep duration and waking quality?",
        options: [
          { label: "7.5–8.5 hours of continuous deep restorative sleep", points: 25 },
          { label: "6.5–7 hours, occasionally wake once for water", points: 18 },
          { label: "Broken sleep, wake 2-3 times per night to urinate", points: 8 },
          { label: "Severe insomnia or chronic sleep fragmentation (<6h)", points: 2 }
        ]
      }
    ]
  }
};

const AUDIT_CARDS = [
  {
    key: "gut",
    icon: Activity,
    title: "Gut & Metabolic Flexibility",
    desc: "Intestinal barrier health, blood-sugar stability and digestive vitality.",
    cta: "Start assessment",
  },
  {
    key: "bolt",
    icon: Zap,
    title: "BOLT Score & Vagus Nerve",
    desc: "CO₂ tolerance, breathing efficiency and parasympathetic resilience.",
    cta: "Measure your BOLT",
  },
  {
    key: "hormone",
    icon: Dna,
    title: "Hormonal & Lifestyle Restoration",
    desc: "Cortisol rhythm, thyroid sensitivity and circadian alignment.",
    cta: "Start assessment",
  },
];

const PATHWAYS = [
  {
    label: "Pathway 01",
    title: "Fit with Reshmi",
    desc: "Clinical movement and metabolic conditioning for lasting physical resilience.",
    cta: "Explore the practice",
    to: "/booking",
  },
  {
    label: "Pathway 02",
    title: "Breathe with Reshmi",
    desc: "Guided 4-7-8 breathwork to restore nervous-system calm and recovery.",
    cta: "Start breathing",
    to: "/breathe",
  },
  {
    label: "Pathway 03",
    title: "Nutrition with Reshmi",
    desc: "Gut, hormone and circadian nutrition built around your own biomarkers.",
    cta: "Explore nutrition",
    to: "/nutrition",
  },
];

const RESET_STEPS = [
  { letter: "R", title: "Reports-Led Precision", desc: "Up to 50 biomarkers tracked to map hormonal and metabolic pathways without guesswork." },
  { letter: "E", title: "Element Nutrition", desc: "Micronutrient and polyphenol density tailored to your lab results." },
  { letter: "S", title: "Somatic Breath Pacing", desc: "4-7-8 and resonance breathing to lower cortisol and steady heart-rate variability." },
  { letter: "E", title: "Evaluation Loop", desc: "Regular check-ins so your protocol keeps pace with how you respond." },
  { letter: "T", title: "Transcendence Goal", desc: "Sustained metabolic flexibility, deep resilience and steady energy." },
];

export default function Home() {
  const navigate = useNavigate();
  const [reels, setReels] = useState<any[]>(INSTAGRAM_REELS);
  const reelsScrollRef = useRef<HTMLDivElement>(null);

  // Diagnostic Audit Modal State
  const [activeAuditType, setActiveAuditType] = useState<string | null>(null);
  const [auditStep, setAuditStep] = useState<number>(0);
  const [auditAnswers, setAuditAnswers] = useState<number[]>([]);
  const [auditComplete, setAuditComplete] = useState<boolean>(false);

  // Home "Breathe Now" 4-7-8 Somatic Feature State
  const [isBreatheActive, setIsBreatheActive] = useState<boolean>(false);
  const [breathePhase, setBreathePhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breatheSeconds, setBreatheSeconds] = useState<number>(4);
  const [breatheCycles, setBreatheCycles] = useState<number>(0);

  // AI Chat Assistant State
  const [chatMode, setChatMode] = useState<"assistant" | "meal" | "symptom">("assistant");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "bot",
      text: "Hello, I am Reshmi's Clinical Wellness Assistant 🌿 Ask me anything regarding functional nutrition, 4-7-8 breathwork protocols, blood biomarkers, or hormone optimization.",
    },
  ]);

  // Load backend reels if present
  useEffect(() => {
    fetch('/api/reels')
      .then(res => res.json())
      .then(data => {
        if (data.reels && data.reels.length > 0) {
          setReels(data.reels);
        }
      })
      .catch(err => console.log('Using default reels:', err));
  }, []);

  // 4-7-8 Somatic Timer Engine for Home Section
  useEffect(() => {
    let timer: any = null;
    if (isBreatheActive) {
      timer = setInterval(() => {
        setBreatheSeconds(prev => {
          if (prev > 1) return prev - 1;

          // Transition phases in the 4-7-8 somatic sequence
          if (breathePhase === 'inhale') {
            setBreathePhase('hold');
            return 7;
          } else if (breathePhase === 'hold') {
            setBreathePhase('exhale');
            return 8;
          } else {
            setBreathePhase('inhale');
            setBreatheCycles(c => c + 1);
            return 4;
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreatheActive, breathePhase]);

  const toggleHomeBreathe = () => {
    if (!isBreatheActive) {
      setIsBreatheActive(true);
      setBreathePhase('inhale');
      setBreatheSeconds(4);
    } else {
      setIsBreatheActive(false);
    }
  };

  const resetHomeBreathe = () => {
    setIsBreatheActive(false);
    setBreathePhase('inhale');
    setBreatheSeconds(4);
    setBreatheCycles(0);
  };

  // Audit Assessment Handlers
  const openAudit = (type: string) => {
    setActiveAuditType(type);
    setAuditStep(0);
    setAuditAnswers([]);
    setAuditComplete(false);
  };

  const handleAuditAnswer = (points: number) => {
    const updated = [...auditAnswers, points];
    setAuditAnswers(updated);
    if (!activeAuditType) return;
    const questionsCount = AUDIT_QUESTIONS[activeAuditType].questions.length;
    if (auditStep + 1 < questionsCount) {
      setAuditStep(auditStep + 1);
    } else {
      setAuditComplete(true);
    }
  };

  const calculateAuditScore = () => {
    if (auditAnswers.length === 0) return 0;
    return Math.round(auditAnswers.reduce((a, b) => a + b, 0));
  };

  const scrollToAuditHub = () => {
    document.getElementById('audit-hub')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newHistory = [...chatHistory, { role: "user", text: chatInput }];
    setChatHistory(newHistory);
    const userQ = chatInput;
    setChatInput("");

    setTimeout(() => {
      let reply = `In clinical ${chatMode} analysis: optimizing this pathway requires synchronizing cellular nutrient density with autonomic vagal regulation. I recommend scheduling a comprehensive clinical biomarker consult with Reshmi.`;

      const lower = userQ.toLowerCase();
      if (lower.includes('insulin') || lower.includes('sugar') || lower.includes('glucose')) {
        reply = "Clinical Insulin Note: Fasting insulin is a 5-10 year early indicator of metabolic dysregulation before HbA1c shifts. Target optimal fasting insulin is <5 µIU/mL. Paired with 10-minute post-meal vagal pacing, glucose clearance increases by up to 24%.";
      } else if (lower.includes('4-7-8') || lower.includes('breathe') || lower.includes('vagus')) {
        reply = "Somatic Breathwork Protocol: 4 seconds nasal inhale activates nitric oxide production; 7 seconds breath hold increases arterial CO₂ to dilate vascular beds; 8 seconds slow exhalation directly stimulates the efferent vagus nerve, dropping resting pulse within 90 seconds.";
      } else if (lower.includes('cortisol') || lower.includes('stress') || lower.includes('adrenal')) {
        reply = "Hormonal Rhythm Note: Cortisol should peak 30 minutes after waking (CAR - Cortisol Awakening Response) and decline steadily toward midnight. High night cortisol suppresses melatonin and blocks deep sleep delta waves.";
      } else if (lower.includes('gut') || lower.includes('bloat') || lower.includes('leak')) {
        reply = "Intestinal Permeability: When zonulin is elevated, mucosal tight junctions loosen, allowing undigested peptides into the bloodstream. This triggers chronic low-grade inflammation. We prioritize polyphenol-rich nutrition, zinc carnosine, and calming the enteric nervous system.";
      }

      setChatHistory([
        ...newHistory,
        { role: "bot", text: reply },
      ]);
    }, 600);
  };

  const phaseDuration = breathePhase === 'inhale' ? 4 : breathePhase === 'hold' ? 7 : 8;
  const orbScale = isBreatheActive
    ? breathePhase === 'inhale' ? [1, 1.25] : breathePhase === 'hold' ? 1.25 : [1.25, 1]
    : [1, 1.04, 1];

  return (
    <div className="bg-canvas text-ink min-h-screen selection:bg-terracotta selection:text-white">

      {/* =====================================================================
          HERO · full-width editorial portrait, serif headline, two CTAs
          ===================================================================== */}
      <section className="pt-[72px]">
        <div className={`${CONTAINER} px-5 sm:px-8 pt-5 sm:pt-6`}>
          <div className="relative rounded-2xl overflow-hidden min-h-[540px] lg:min-h-[640px] flex items-center bg-surface">
            <img
              src={HERO_IMAGE}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/85 to-canvas/10 lg:via-canvas/55 lg:to-transparent" />

            <div className="relative px-6 sm:px-12 lg:px-16 py-14 max-w-[760px]">
              <h1 className="font-serif font-light uppercase text-[38px] sm:text-[52px] lg:text-[60px] leading-[1.06] tracking-[0.01em] text-ink">
                Real science.
                <br />
                Deep breathwork.
                <br />
                Sustainable vitality.
              </h1>

              <p className={`${BODY} max-w-[480px] mt-6`}>
                Clinical nutrition and somatic breathwork, decoded beyond symptoms: from laboratory diagnostics to nervous-system restoration.
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-9">
                <button onClick={scrollToAuditHub} className={BTN_PRIMARY}>
                  Take free assessment
                </button>
                <button onClick={() => navigate('/booking')} className={BTN_OUTLINE}>
                  Apply for 1:1 care
                </button>
              </div>
            </div>
          </div>

          {/* Quiet trust row */}
          <dl className="grid grid-cols-3 gap-4 mt-8 sm:mt-10 text-center sm:text-left">
            {[
              ["50+", "Biomarkers tracked"],
              ["17+", "Years in practice"],
              ["27-Yr", "Diagnostic legacy"],
            ].map(([num, label]) => (
              <div key={label} className="sm:px-6 sm:border-l first:border-l-0 border-line">
                <dt className="font-serif font-light text-[28px] sm:text-[36px] text-ink leading-none">{num}</dt>
                <dd className="mt-2 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-faint">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* =====================================================================
          DIAGNOSTIC AUDIT HUB · three sandstone cards
          ===================================================================== */}
      <section id="audit-hub" className={SECTION}>
        <div className={`${CONTAINER} text-center`}>
          <p className={EYEBROW}>Diagnostic Audit Hub</p>
          <h2 className={`${H2} italic mt-4`}>Identify your health baseline</h2>
          <p className={`${BODY} max-w-[600px] mx-auto mt-5`}>
            Short clinical self-assessments to pinpoint where your nervous system, metabolism and hormones need support, before your consultation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mt-12 text-left">
            {AUDIT_CARDS.map(({ key, icon: Icon, title, desc, cta }) => (
              <button
                key={key}
                onClick={() => openAudit(key)}
                className="group flex flex-col items-start bg-surface border border-line rounded-xl p-8 text-left transition-colors hover:border-terracotta cursor-pointer"
              >
                <Icon size={30} strokeWidth={1.25} className="text-ink" aria-hidden="true" />
                <h3 className="font-serif font-normal text-[22px] leading-snug text-ink mt-8">{title}</h3>
                <p className="text-[14px] leading-relaxed text-muted mt-3">{desc}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.12em] uppercase text-accent">
                  {cta}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => openAudit('sleep')}
            className="mt-8 text-[13px] text-muted hover:text-ink underline underline-offset-4 decoration-line hover:decoration-terracotta cursor-pointer"
          >
            Also available: Sleep &amp; airway check (STOP-BANG)
          </button>
        </div>
      </section>

      {/* =====================================================================
          "BREATHE NOW" · espresso band with 4-7-8 ring
          ===================================================================== */}
      <section className="bg-band text-linen">
        <div className={`${CONTAINER} ${SECTION} grid grid-cols-1 lg:grid-cols-2 gap-14 items-center`}>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-terracotta">Somatic feature</p>
            <h2 className="font-serif font-light text-[40px] sm:text-[52px] lg:text-[60px] leading-[1.05] tracking-tight mt-4">
              “Breathe Now”
            </h2>
            <p className="font-serif italic font-light text-[22px] sm:text-[26px] text-terracotta mt-2">
              A guided 4-7-8 pacer
            </p>
            <p className="text-[16px] sm:text-[17px] leading-relaxed text-linen/75 max-w-[460px] mt-6">
              Four seconds in, seven held, eight out. A slow, guided rhythm that settles your nervous system in a few minutes, wherever you are.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-9">
              <button onClick={toggleHomeBreathe} className={BTN_PRIMARY}>
                {isBreatheActive ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                {isBreatheActive ? 'Pause session' : 'Breathe now'}
              </button>
              <button
                onClick={resetHomeBreathe}
                className="p-3.5 rounded-md border border-linen/25 text-linen hover:bg-linen/10 transition-colors cursor-pointer"
                aria-label="Reset counter"
              >
                <RotateCcw size={15} />
              </button>
              <span className="text-[12px] text-linen/60 ml-1" aria-live="polite">
                {breatheCycles} {breatheCycles === 1 ? 'cycle' : 'cycles'} completed
              </span>
            </div>

            <Link
              to="/breathe"
              className="inline-flex items-center gap-2 mt-8 text-[12px] font-semibold tracking-[0.12em] uppercase text-terracotta hover:text-linen transition-colors no-underline"
            >
              Open the full breathing sanctuary <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] flex items-center justify-center">
              <motion.div
                aria-hidden="true"
                animate={{ scale: orbScale, opacity: isBreatheActive ? 0.9 : 0.5 }}
                transition={{
                  duration: isBreatheActive ? phaseDuration : 3,
                  ease: "easeInOut",
                  repeat: isBreatheActive ? 0 : Infinity,
                }}
                className="absolute inset-0 rounded-full bg-radial from-terracotta/35 via-terracotta/10 to-transparent blur-2xl"
              />
              <motion.button
                onClick={toggleHomeBreathe}
                animate={{ scale: orbScale }}
                transition={{
                  duration: isBreatheActive ? phaseDuration : 3,
                  ease: "easeInOut",
                  repeat: isBreatheActive ? 0 : Infinity,
                }}
                aria-label={isBreatheActive ? 'Pause breathing session' : 'Start breathing session'}
                className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] rounded-full border border-terracotta/70 bg-[#2A1B14] shadow-[0_0_60px_rgba(212,132,100,0.35)] flex flex-col items-center justify-center select-none cursor-pointer"
              >
                <span className="text-[10px] tracking-[0.22em] uppercase text-terracotta font-semibold">
                  {isBreatheActive ? (breathePhase === 'inhale' ? 'Inhale' : breathePhase === 'hold' ? 'Hold' : 'Exhale') : 'Somatic cadence'}
                </span>
                <span className="font-serif font-light text-[56px] sm:text-[64px] leading-none text-linen my-2">
                  {isBreatheActive ? breatheSeconds : '4-7-8'}
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-linen/60">
                  {isBreatheActive ? 'Vagal entrainment' : 'Tap to start'}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PATHWAYS · three ways to work together
          ===================================================================== */}
      <section id="pathways" className={SECTION}>
        <div className={CONTAINER}>
          <div className="text-center">
            <p className={EYEBROW}>Specialised pathways</p>
            <h2 className={`${H2} mt-4`}>
              Three ways to work with <em>Reshmi</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mt-12">
            {PATHWAYS.map((p) => (
              <Link
                key={p.title}
                to={p.to}
                className="group flex flex-col bg-surface border border-line rounded-xl p-8 no-underline transition-colors hover:border-terracotta"
              >
                <span className="text-[11px] tracking-[0.2em] uppercase text-faint">{p.label}</span>
                <h3 className="font-serif font-normal text-[24px] text-ink mt-3">{p.title}</h3>
                <p className="text-[14px] leading-relaxed text-muted mt-3 flex-1">{p.desc}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.12em] uppercase text-accent">
                  {p.cta}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          THE RESET METHOD
          ===================================================================== */}
      <section id="method" className={`${SECTION} bg-surface`}>
        <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start`}>
          <div className="lg:col-span-5">
            <p className={EYEBROW}>The RESET method</p>
            <h2 className={`${H2} mt-4`}>
              A clinical protocol that <em>evolves</em> with you.
            </h2>
            <p className={`${BODY} mt-6 max-w-[460px]`}>
              Care shouldn't stand still. Yours adapts as your labs, hormones and lifestyle change.
            </p>
            <button onClick={() => navigate('/booking')} className={`${BTN_DARK} mt-9`}>
              Book a consultation
            </button>
          </div>

          <ol className="lg:col-span-7 divide-y divide-line border-y border-line">
            {RESET_STEPS.map((step, idx) => (
              <li key={idx} className="flex items-start gap-6 py-6">
                <span className="font-serif font-light text-[40px] leading-none text-accent w-10 shrink-0">{step.letter}</span>
                <div>
                  <h3 className="font-serif font-normal text-[20px] text-ink">{step.title}</h3>
                  <p className="text-[14px] sm:text-[15px] leading-relaxed text-muted mt-1.5">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* =====================================================================
          AI LAB COMPANION
          ===================================================================== */}
      <section id="ai-lab" className={SECTION}>
        <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center`}>
          <div className="lg:col-span-5">
            <p className={EYEBROW}>Intelligent lab companion</p>
            <h2 className={`${H2} mt-4`}>
              Clinical knowledge, <em>amplified by AI</em>.
            </h2>
            <p className={`${BODY} mt-6`}>
              Ask about a biomarker, plan cycle-synced meals, or decode what your nervous system is telling you.
            </p>
            <ul className="mt-8 space-y-3 text-[14px] text-muted">
              <li className="flex gap-3"><Check size={16} className="text-agave mt-0.5 shrink-0" /><span><strong className="text-ink font-semibold">Biomarker translator:</strong> lab results in plain language</span></li>
              <li className="flex gap-3"><Check size={16} className="text-agave mt-0.5 shrink-0" /><span><strong className="text-ink font-semibold">Circadian sync:</strong> meal timing aligned with your body clock</span></li>
              <li className="flex gap-3"><Check size={16} className="text-agave mt-0.5 shrink-0" /><span><strong className="text-ink font-semibold">Somatic guidance:</strong> personalised 4-7-8 recommendations</span></li>
            </ul>
          </div>

          <div className="lg:col-span-7 bg-card border border-line rounded-xl p-5 sm:p-7 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line mb-4">
              <span className="text-[12px] font-semibold tracking-[0.14em] uppercase text-ink">
                Reshmi's Clinical AI Assistant
              </span>
              <div className="flex gap-1.5">
                {(['assistant', 'meal', 'symptom'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setChatMode(mode)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                      chatMode === mode
                        ? 'bg-ink text-canvas'
                        : 'bg-surface text-muted hover:text-ink'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-60 overflow-y-auto space-y-3 pr-2 mb-4" aria-live="polite">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl text-[13px] sm:text-sm leading-relaxed max-w-[85%] ${
                    msg.role === 'bot'
                      ? 'bg-surface text-ink mr-auto'
                      : 'bg-terracotta text-white ml-auto'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask about fasting insulin, 4-7-8 breathwork, or gut healing…"
                aria-label="Ask the assistant a question"
                className="flex-1 min-w-0 px-4 py-3 rounded-md bg-canvas border border-line text-[13px] text-ink placeholder:text-faint focus:outline-none focus:border-terracotta"
              />
              <button onClick={handleSendChat} className={BTN_DARK}>
                Send
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          INSTAGRAM REELS
          ===================================================================== */}
      <section className={`${SECTION} bg-surface`}>
        <div className={CONTAINER}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <p className={EYEBROW}>Clinical community</p>
              <h2 className={`${H2} mt-4`}>
                Daily insights on <em>Instagram</em>.
              </h2>
              <p className="text-[15px] text-muted mt-3">
                Bite-sized nutrition and breathwork education from @fitwithreshmi.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => reelsScrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}
                className="p-3 rounded-md border border-line text-ink hover:bg-card transition-colors cursor-pointer"
                aria-label="Scroll reels left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => reelsScrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}
                className="p-3 rounded-md border border-line text-ink hover:bg-card transition-colors cursor-pointer"
                aria-label="Scroll reels right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div ref={reelsScrollRef} className="flex gap-5 overflow-x-auto pb-4">
            {reels.map((reel, idx) => (
              <a
                key={reel.id || idx}
                href={reel.instagramUrl || "https://instagram.com/fitwithreshmi"}
                target="_blank"
                rel="noreferrer"
                className="flex-shrink-0 w-60 sm:w-64 aspect-[9/15] rounded-xl overflow-hidden bg-black relative group"
              >
                {reel.video_url ? (
                  <video
                    src={reel.video_url}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 inset-x-4 text-white">
                  <span className="text-[10px] tracking-[0.14em] text-terracotta uppercase font-semibold block mb-1">
                    @fitwithreshmi
                  </span>
                  <h3 className="font-serif text-[15px] leading-snug line-clamp-2">{reel.title}</h3>
                  <div className="flex items-center justify-between text-[11px] text-white/80 mt-2">
                    <span className="flex items-center gap-1"><Play size={10} className="fill-current" /> Watch</span>
                    <span>{reel.views || "12.4k"} views</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          CLOSING CTA + FOOTER
          ===================================================================== */}
      <footer className={SECTION}>
        <div className="max-w-[820px] mx-auto text-center">
          <p className={EYEBROW}>Begin your protocol</p>
          <h2 className={`${H2} mt-4`}>
            Ready to experience <em>sustainable vitality</em>?
          </h2>
          <p className={`${BODY} max-w-[520px] mx-auto mt-6`}>
            Book a comprehensive assessment with Reshmi Verma to make sense of your lab data and restore balance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-9">
            <button onClick={() => navigate('/booking')} className={BTN_PRIMARY}>
              Book 1:1 consultation
            </button>
            <button onClick={scrollToAuditHub} className={BTN_OUTLINE}>
              Take free assessment
            </button>
          </div>
        </div>

        <div className={`${CONTAINER} mt-[72px] pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-faint text-center`}>
          <span>Reshmi Verma · Director, Rainbow Medinova · Co-Founder, Neofit Gym</span>
          <span>© {new Date().getFullYear()} Reshmi Verma. All rights reserved.</span>
        </div>
      </footer>

      {/* =====================================================================
          ASSESSMENT MODAL
          ===================================================================== */}
      <AnimatePresence>
        {activeAuditType && (
          <div
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={AUDIT_QUESTIONS[activeAuditType].title}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-canvas border border-line rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setActiveAuditType(null)}
                className="absolute top-5 right-5 p-2 rounded-md text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>

              {!auditComplete ? (
                <div>
                  <p className={EYEBROW}>
                    Question {auditStep + 1} of {AUDIT_QUESTIONS[activeAuditType].questions.length}
                  </p>
                  <h3 className="font-serif font-light text-[26px] leading-tight text-ink mt-3 pr-8">
                    {AUDIT_QUESTIONS[activeAuditType].title}
                  </h3>
                  <p className="text-[13px] text-muted mt-2 mb-8">
                    {AUDIT_QUESTIONS[activeAuditType].subtitle}
                  </p>

                  <h4 className="font-serif text-[19px] leading-snug text-ink mb-5">
                    {AUDIT_QUESTIONS[activeAuditType].questions[auditStep].question}
                  </h4>

                  <div className="space-y-2.5 mb-8">
                    {AUDIT_QUESTIONS[activeAuditType].questions[auditStep].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAuditAnswer(opt.points)}
                        className="w-full text-left p-4 rounded-lg bg-surface hover:bg-terracotta hover:text-white border border-line transition-colors text-[14px] text-ink cursor-pointer"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="w-full bg-surface h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-terracotta h-full transition-all duration-300"
                      style={{ width: `${((auditStep + 1) / AUDIT_QUESTIONS[activeAuditType].questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-terracotta/15 text-terracotta mx-auto flex items-center justify-center mb-5">
                    <Check size={28} />
                  </div>
                  <p className={EYEBROW}>Your baseline index</p>
                  <h3 className="font-serif font-light text-[44px] text-ink mt-2 mb-3">
                    {calculateAuditScore()} <span className="text-faint text-[24px]">/ 100</span>
                  </h3>
                  <p className="text-[14px] sm:text-[15px] leading-relaxed text-muted max-w-md mx-auto mb-8">
                    {calculateAuditScore() >= 80
                      ? "High functional balance with minor optimization opportunities. An excellent foundation for advanced performance."
                      : calculateAuditScore() >= 55
                      ? "Moderate autonomic or metabolic drag detected. This pattern typically responds well to a functional nutrition protocol."
                      : "Significant autonomic and metabolic strain flagged. Prioritising 4-7-8 breathing and a clinical biomarker review is strongly recommended."}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setActiveAuditType(null);
                        navigate('/booking');
                      }}
                      className={`${BTN_PRIMARY} w-full sm:w-auto`}
                    >
                      Book 1:1 consult
                    </button>
                    <button
                      onClick={() => {
                        setActiveAuditType(null);
                        navigate('/breathe');
                      }}
                      className={`${BTN_OUTLINE} w-full sm:w-auto`}
                    >
                      Practise 4-7-8 breathing
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
