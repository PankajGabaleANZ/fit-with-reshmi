import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { INSTAGRAM_REELS } from "../lib/data";
import { 
  Activity, Play, Pause, RotateCcw, Heart, ChevronLeft, ChevronRight, 
  ArrowRight, Check, X, Shield, Dna, Wind, Sparkles, Timer, Compass, 
  ExternalLink, Layers, Microscope, Clock, Award, Moon, CheckCircle2,
  AlertTriangle, Flame, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../lib/theme";
import AmbientCanvas from "../components/AmbientCanvas";
import "../styles-design.css";

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

export default function Home() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [reels, setReels] = useState<any[]>(INSTAGRAM_REELS);
  const reelsScrollRef = useRef<HTMLDivElement>(null);

  // Mouse coordinate tracker for cursor glow
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });

  // Quick 60-second baseline audit strip state
  const [quickPillar, setQuickPillar] = useState<'gut' | 'bolt' | 'hormone'>('gut');
  const [quickAnswers, setQuickAnswers] = useState<number[]>([25, 25, 25]);
  const [quickScoreCalculated, setQuickScoreCalculated] = useState<boolean>(false);

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

  // Track cursor position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#1A110D] text-[#2A1B14] dark:text-[#FAF8F5] min-h-screen selection:bg-[#D48464] selection:text-white transition-colors duration-300 relative overflow-hidden">
      
      {/* =========================================================================
          INTERACTIVE AMBIENT CANVAS & PERSISTENT STAGE
          ========================================================================= */}
      <AmbientCanvas isBreathing={isBreatheActive} breathePhase={breathePhase} />

      <div className="stage" aria-hidden="true">
        <div className="blob" id="bJade"></div>
        <div className="blob" id="bCoral"></div>
        <div className="blob" id="bGold"></div>
      </div>

      <div className="field" aria-hidden="true"></div>
      <div className="grain" aria-hidden="true"></div>

      {/* Dynamic Cursor Glow Aura */}
      <div 
        className="cursor-glow hidden md:block" 
        style={{ left: mousePos.x, top: mousePos.y }}
        aria-hidden="true"
      />

      {/* =========================================================================
          HERO SECTION (SCENE 0) · EDITORIAL ARCH PORTRAIT & DUAL CTAS
          ========================================================================= */}
      <section className="pt-36 pb-20 md:pt-44 md:pb-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Hero Left: Editorial Typography & Exact Buttons from Specification */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Eyebrow Pill Tag */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#EFECE6]/90 dark:bg-[#2E2019]/90 text-[#2A1B14] dark:text-[#E6D7CD] text-[10px] sm:text-[11px] font-sans font-bold tracking-[0.22em] uppercase mb-6 border border-[#2A1B14]/12 dark:border-white/12 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#D48464] animate-pulse"></span>
              <span>INTEGRATIVE FUNCTIONAL WELLNESS // RESHMI VERMA</span>
            </div>

            {/* Headline matching snapshot */}
            <h1 className="font-sans font-black text-4xl sm:text-5xl lg:text-[4.2rem] tracking-tight leading-[1.05] text-[#2A1B14] dark:text-[#FAF8F5] mb-6 uppercase">
              REAL SCIENCE.
              <br />
              <span className="text-[#D48464] italic">DEEP BREATHWORK.</span>
              <br />
              SUSTAINABLE VITALITY.
            </h1>

            <p className="text-base sm:text-lg text-[#564238] dark:text-[#E6D7CD] font-normal leading-relaxed max-w-xl mb-9">
              Clinical nutritional biochemistry and somatic autonomic regulation decoded beyond superficial symptoms. Bridging laboratory diagnostics with nervous system restoration.
            </p>

            {/* Exact Buttons from Specification Sheet:
                1. TAKE FREE ASSESSMENT (Terracotta #D48464 solid)
                2. APPLY FOR 1:1 CARE (Espresso Outline #2A1B14)
            */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => {
                  const hub = document.getElementById('audit-hub');
                  if (hub) hub.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#D48464] hover:bg-[#C27354] text-white text-xs font-bold uppercase tracking-[0.16em] shadow-lg shadow-[#D48464]/30 hover:scale-[1.02] transition-all cursor-pointer text-center"
              >
                TAKE FREE ASSESSMENT
              </button>

              <button
                onClick={() => navigate('/booking')}
                className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-[#2A1B14] dark:border-[#FAF8F5] text-[#2A1B14] dark:text-[#FAF8F5] hover:bg-[#2A1B14] hover:text-[#FAF8F5] dark:hover:bg-[#FAF8F5] dark:hover:text-[#2A1B14] text-xs font-bold uppercase tracking-[0.16em] transition-all cursor-pointer text-center backdrop-blur-sm"
              >
                APPLY FOR 1:1 CARE
              </button>
            </div>

            {/* Clinical Trust Bar */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-10 pt-10 mt-10 border-t border-[#2A1B14]/12 dark:border-white/12 w-full text-left">
              <div>
                <strong className="block text-2xl sm:text-3xl font-serif font-bold text-[#2A1B14] dark:text-white">50+</strong>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#7E685D] dark:text-white/60">Biomarkers Tracked</span>
              </div>
              <div className="w-px h-8 bg-[#2A1B14]/12 dark:bg-white/12 hidden sm:block" />
              <div>
                <strong className="block text-2xl sm:text-3xl font-serif font-bold text-[#2A1B14] dark:text-white">17+</strong>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#7E685D] dark:text-white/60">Years in Practice</span>
              </div>
              <div className="w-px h-8 bg-[#2A1B14]/12 dark:bg-white/12 hidden sm:block" />
              <div>
                <strong className="block text-2xl sm:text-3xl font-serif font-bold text-[#D48464]">27-Yr</strong>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#7E685D] dark:text-white/60">Diagnostic Legacy</span>
              </div>
            </div>
          </div>

          {/* Hero Right: ARCH EDITORIAL PORTRAIT OF RESHMI VERMA WITH ROTATING HALO & FLOATING BADGES */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="portrait-wrap max-w-sm sm:max-w-md">
              
              {/* Spinning Conic Gradient Halo */}
              <div className="halo" />

              {/* The Arch Portrait Element */}
              <div className="portrait">
                <img
                  src="/IMG_5514-scaled-e1762270577699.jpg"
                  alt="Reshmi Verma - Functional Nutritionist & Somatic Breathwork Specialist"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                />
                
                {/* Subtle gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A110D]/85 via-transparent to-transparent pointer-events-none" />
                
                {/* Bottom Credential Tag */}
                <div className="absolute bottom-5 left-5 right-5 text-white text-left pointer-events-none">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-[#FAF8F5]/90 block mb-1">
                    DIRECTOR · RAINBOW MEDINOVA
                  </span>
                  <p className="font-serif text-lg font-bold text-white leading-snug">
                    Reshmi Verma
                  </p>
                  <p className="text-xs text-[#EFECE6]/90 font-light mt-0.5">
                    Decades of clinical diagnostics meeting cellular nutrition
                  </p>
                </div>
              </div>

              {/* Float Card 1: Top Left */}
              <div className="float-card fc1 hidden sm:block">
                <div className="t font-serif">50+ Biomarkers</div>
                <div className="s font-sans text-xs">Cellular Lab Diagnostics</div>
              </div>

              {/* Float Card 2: Bottom Right */}
              <div className="float-card fc2 hidden sm:block">
                <div className="t font-serif">1:1 Clinical Care</div>
                <div className="s font-sans text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Accepting Consultations</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 1: SPECIALISED PATHWAYS (Three Pillars)
          ========================================================================= */}
      <section id="pathways" className="py-20 md:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#2A1B14]/10 dark:border-white/10 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFECE6] dark:bg-[#2E2019] text-[#7E685D] dark:text-[#E6D7CD] text-[10px] font-sans font-bold tracking-[0.22em] uppercase mb-4 border border-[#2A1B14]/10">
            SPECIALISED PATHWAYS
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#2A1B14] dark:text-white tracking-tight">
            Three Pillars of <em>Clinical Transformation</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* Pathway 1: Fit with Reshmi */}
          <div 
            onClick={() => navigate('/booking')}
            className="bg-[#EFECE6]/85 dark:bg-[#251913]/85 backdrop-blur-md border border-[#2A1B14]/10 dark:border-white/10 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-[#D48464] transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#7E685D] dark:text-white/60 font-bold block mb-2">
                PATHWAY 01
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#2A1B14] dark:text-white mb-3 group-hover:text-[#D48464] transition-colors">
                Fit with Reshmi
              </h3>
              <p className="text-sm text-[#564238] dark:text-[#E6D7CD] leading-relaxed mb-6 font-normal">
                Clinical movement and metabolic conditioning. Address the root cause of chronic inflammation, postural stagnation, and physical resilience.
              </p>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#2A1B14] dark:text-white flex items-center gap-2 group-hover:text-[#D48464] transition-colors">
              Explore Practice <span>→</span>
            </div>
          </div>

          {/* Pathway 2: Breathe with Reshmi */}
          <div 
            onClick={() => navigate('/breathe')}
            className="bg-[#EFECE6]/85 dark:bg-[#251913]/85 backdrop-blur-md border border-[#2A1B14]/10 dark:border-white/10 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-[#D48464] transition-all group cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-[#D48464]/15 border border-[#D48464]/30 text-[9px] font-mono font-bold text-[#D48464]">
              4-7-8 Somatic
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#7E685D] dark:text-white/60 font-bold block mb-2">
                PATHWAY 02
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#D48464] mb-3 group-hover:scale-[1.02] transition-transform origin-left">
                Breathe with Reshmi
              </h3>
              <p className="text-sm text-[#564238] dark:text-[#E6D7CD] leading-relaxed mb-6 font-normal">
                Somatic regulation and parasympathetic recovery. Guided cadence breathwork with immersive ambient AI atmospheres to restore neurological calm.
              </p>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#2A1B14] dark:text-white flex items-center gap-2 group-hover:text-[#D48464] transition-colors">
              Start Breathing (4-7-8) <span>→</span>
            </div>
          </div>

          {/* Pathway 3: Nutrition with Reshmi */}
          <div 
            onClick={() => navigate('/nutrition')}
            className="bg-[#EFECE6]/85 dark:bg-[#251913]/85 backdrop-blur-md border border-[#4D735D]/30 hover:border-[#4D735D] p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-[#4D735D]/15 border border-[#4D735D]/40 text-[9px] font-mono font-bold text-[#4D735D]">
              Bio-Alchemy
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#4D735D] font-bold block mb-2">
                PATHWAY 03
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#4D735D] mb-3 group-hover:scale-[1.02] transition-transform origin-left">
                Nutrition with Reshmi
              </h3>
              <p className="text-sm text-[#564238] dark:text-[#E6D7CD] leading-relaxed mb-6 font-normal">
                Futuristic cellular biochemistry, gut microbiome alchemy, and circadian chrono-nutrition designed around your unique biological markers.
              </p>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#4D735D] flex items-center gap-2 group-hover:translate-x-1 transition-transform">
              Explore Nutritive Alchemy <span>→</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2: DIAGNOSTIC AUDIT HUB / THE BRIEF ASSESSMENT SUITE
          ========================================================================= */}
      <section id="audit-hub" className="py-20 md:py-28 bg-[#FAF8F5]/90 dark:bg-[#1A110D]/90 border-t border-[#2A1B14]/10 dark:border-white/10 px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          
          {/* Eyebrow and Italic Serif Title from Snapshot */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFECE6] dark:bg-[#2E2019] text-[#7E685D] dark:text-[#E6D7CD] text-[10px] font-sans font-bold tracking-[0.22em] uppercase mb-4 border border-[#2A1B14]/10">
            DIAGNOSTIC AUDIT HUB (PAGE 1)
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-[#2A1B14] dark:text-[#FAF8F5] tracking-tight mb-4">
            IDENTIFY YOUR HEALTH BASELINE
          </h2>
          
          <p className="text-sm sm:text-base text-[#564238] dark:text-[#E6D7CD] max-w-2xl mx-auto mb-12 leading-relaxed font-normal">
            Precision clinical self-assessments to pinpoint autonomic dysregulation, metabolic stagnation, and gut permeability before your formal consultation.
          </p>

          {/* Quick 60-Second Health Baseline Audit Strip */}
          <div className="bg-white/80 dark:bg-[#251913]/90 border-2 border-[#D48464]/30 rounded-[2.5rem] p-6 sm:p-8 mb-14 shadow-lg backdrop-blur-md text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#2A1B14]/10 dark:border-white/10 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D48464] font-bold block mb-1">
                  INSTANT CLINICAL TRIAGE
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1B14] dark:text-white">
                  60-Second Health Baseline Audit
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setQuickPillar('gut')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    quickPillar === 'gut' 
                      ? 'bg-[#D48464] text-white shadow-md' 
                      : 'bg-[#EFECE6] dark:bg-[#1D130E] text-[#564238] dark:text-[#E6D7CD]'
                  }`}
                >
                  Gut & Metabolism
                </button>
                <button
                  onClick={() => setQuickPillar('bolt')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    quickPillar === 'bolt' 
                      ? 'bg-[#D48464] text-white shadow-md' 
                      : 'bg-[#EFECE6] dark:bg-[#1D130E] text-[#564238] dark:text-[#E6D7CD]'
                  }`}
                >
                  Vagus & Breath
                </button>
                <button
                  onClick={() => setQuickPillar('hormone')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    quickPillar === 'hormone' 
                      ? 'bg-[#D48464] text-white shadow-md' 
                      : 'bg-[#EFECE6] dark:bg-[#1D130E] text-[#564238] dark:text-[#E6D7CD]'
                  }`}
                >
                  Hormones & Sleep
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickPillar === 'gut' && (
                <>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1D130E] border border-[#2A1B14]/10">
                    <p className="text-xs font-bold text-[#2A1B14] dark:text-white mb-2">1. Post-Meal Energy Levels</p>
                    <div className="space-y-1.5">
                      {["Clean sustained energy", "Occasional mild slump", "Heavy daily crashes"].map((lbl, i) => (
                        <label key={i} className="flex items-center gap-2 text-xs text-[#564238] dark:text-[#E6D7CD] cursor-pointer">
                          <input type="radio" name="qg1" defaultChecked={i === 0} onChange={() => { const q = [...quickAnswers]; q[0] = 25 - i * 10; setQuickAnswers(q); }} />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1D130E] border border-[#2A1B14]/10">
                    <p className="text-xs font-bold text-[#2A1B14] dark:text-white mb-2">2. Evening Bloating Tendency</p>
                    <div className="space-y-1.5">
                      {["Flat and comfortable", "Occasional puffiness", "Chronic evening distension"].map((lbl, i) => (
                        <label key={i} className="flex items-center gap-2 text-xs text-[#564238] dark:text-[#E6D7CD] cursor-pointer">
                          <input type="radio" name="qg2" defaultChecked={i === 0} onChange={() => { const q = [...quickAnswers]; q[1] = 25 - i * 10; setQuickAnswers(q); }} />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1D130E] border border-[#2A1B14]/10">
                    <p className="text-xs font-bold text-[#2A1B14] dark:text-white mb-2">3. Intermittent Fasting Comfort</p>
                    <div className="space-y-1.5">
                      {["Effortless 4-5 hours", "Moderate hunger peaks", "Severe hangry sugar cravings"].map((lbl, i) => (
                        <label key={i} className="flex items-center gap-2 text-xs text-[#564238] dark:text-[#E6D7CD] cursor-pointer">
                          <input type="radio" name="qg3" defaultChecked={i === 0} onChange={() => { const q = [...quickAnswers]; q[2] = 25 - i * 10; setQuickAnswers(q); }} />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {quickPillar === 'bolt' && (
                <>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1D130E] border border-[#2A1B14]/10">
                    <p className="text-xs font-bold text-[#2A1B14] dark:text-white mb-2">1. Breath Hold Comfort (BOLT)</p>
                    <div className="space-y-1.5">
                      {["> 30 seconds (High CO₂ tolerance)", "18-29s (Average)", "< 15s (Sympathetic stress)"].map((lbl, i) => (
                        <label key={i} className="flex items-center gap-2 text-xs text-[#564238] dark:text-[#E6D7CD] cursor-pointer">
                          <input type="radio" name="qb1" defaultChecked={i === 0} onChange={() => { const q = [...quickAnswers]; q[0] = 25 - i * 10; setQuickAnswers(q); }} />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1D130E] border border-[#2A1B14]/10">
                    <p className="text-xs font-bold text-[#2A1B14] dark:text-white mb-2">2. Daytime Nasal Breathing</p>
                    <div className="space-y-1.5">
                      {["100% nasal 24/7", "Occasionally mouth during stress", "Frequent mouth breathing"].map((lbl, i) => (
                        <label key={i} className="flex items-center gap-2 text-xs text-[#564238] dark:text-[#E6D7CD] cursor-pointer">
                          <input type="radio" name="qb2" defaultChecked={i === 0} onChange={() => { const q = [...quickAnswers]; q[1] = 25 - i * 10; setQuickAnswers(q); }} />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1D130E] border border-[#2A1B14]/10">
                    <p className="text-xs font-bold text-[#2A1B14] dark:text-white mb-2">3. Stress Recovery Speed</p>
                    <div className="space-y-1.5">
                      {["Calm within 2 minutes", "Takes 5-10 minutes", "Lingering elevated tension"].map((lbl, i) => (
                        <label key={i} className="flex items-center gap-2 text-xs text-[#564238] dark:text-[#E6D7CD] cursor-pointer">
                          <input type="radio" name="qb3" defaultChecked={i === 0} onChange={() => { const q = [...quickAnswers]; q[2] = 25 - i * 10; setQuickAnswers(q); }} />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {quickPillar === 'hormone' && (
                <>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1D130E] border border-[#2A1B14]/10">
                    <p className="text-xs font-bold text-[#2A1B14] dark:text-white mb-2">1. Morning Alertness</p>
                    <div className="space-y-1.5">
                      {["Awake and alert instantly", "Need 10 mins and water", "Heavy fatigue / groggy"].map((lbl, i) => (
                        <label key={i} className="flex items-center gap-2 text-xs text-[#564238] dark:text-[#E6D7CD] cursor-pointer">
                          <input type="radio" name="qh1" defaultChecked={i === 0} onChange={() => { const q = [...quickAnswers]; q[0] = 25 - i * 10; setQuickAnswers(q); }} />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1D130E] border border-[#2A1B14]/10">
                    <p className="text-xs font-bold text-[#2A1B14] dark:text-white mb-2">2. Extremities Temperature</p>
                    <div className="space-y-1.5">
                      {["Always warm hands & feet", "Mild cold in winter", "Chronic icy cold extremities"].map((lbl, i) => (
                        <label key={i} className="flex items-center gap-2 text-xs text-[#564238] dark:text-[#E6D7CD] cursor-pointer">
                          <input type="radio" name="qh2" defaultChecked={i === 0} onChange={() => { const q = [...quickAnswers]; q[1] = 25 - i * 10; setQuickAnswers(q); }} />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1D130E] border border-[#2A1B14]/10">
                    <p className="text-xs font-bold text-[#2A1B14] dark:text-white mb-2">3. Sleep Quality & Rest</p>
                    <div className="space-y-1.5">
                      {["Deep uninterrupted 8 hours", "1 brief wake up", "Restless broken insomnia"].map((lbl, i) => (
                        <label key={i} className="flex items-center gap-2 text-xs text-[#564238] dark:text-[#E6D7CD] cursor-pointer">
                          <input type="radio" name="qh3" defaultChecked={i === 0} onChange={() => { const q = [...quickAnswers]; q[2] = 25 - i * 10; setQuickAnswers(q); }} />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-[#2A1B14]/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#7E685D] dark:text-white/60">Calculated Score:</span>
                <strong className="text-xl font-bold text-[#D48464]">{Math.round((quickAnswers[0] + quickAnswers[1] + quickAnswers[2]) * 1.33)} / 100</strong>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#D48464]/15 text-[#D48464] font-bold">
                  {(quickAnswers[0] + quickAnswers[1] + quickAnswers[2]) >= 60 ? "Balanced Baseline" : "Subclinical Compensation"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openAudit(quickPillar)}
                  className="px-6 py-2.5 rounded-full bg-[#2A1B14] dark:bg-white text-white dark:text-[#2A1B14] text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all cursor-pointer"
                >
                  Launch Full Clinical Audit →
                </button>
              </div>
            </div>
          </div>

          {/* 4 Clinical Diagnostic Cards on Subtle Soft Sandstone Clay (#EFECE6) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            {/* Card 1: Gut & Metabolic Flexibility */}
            <div 
              onClick={() => openAudit('gut')}
              className="bg-[#EFECE6]/90 dark:bg-[#251913]/90 border border-[#2A1B14]/10 dark:border-white/10 p-7 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-[#D48464] transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black/30 border border-[#2A1B14]/10 dark:border-white/10 flex items-center justify-center text-[#D48464] mb-6 group-hover:scale-110 transition-transform">
                  <Activity size={24} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7E685D] dark:text-white/60 font-bold block mb-2">
                  AUDIT 01 · BIO-METABOLIC
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2A1B14] dark:text-white mb-3">
                  Gut & Metabolic Flexibility
                </h3>
                <p className="text-xs text-[#564238] dark:text-[#E6D7CD] leading-relaxed mb-6">
                  Clinical assessment of intestinal mucosal permeability, postprandial glucose stability, and microbial short-chain fatty acids.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 text-[#2A1B14] dark:text-white/80">Fasting Insulin</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 text-[#2A1B14] dark:text-white/80">Zonulin Barrier</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 text-[#2A1B14] dark:text-white/80">SCFA Butyrate</span>
                </div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#D48464] flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                Take Free Assessment <span>→</span>
              </div>
            </div>

            {/* Card 2: BOLT Score & Vagus Nerve */}
            <div 
              onClick={() => openAudit('bolt')}
              className="bg-[#EFECE6]/90 dark:bg-[#251913]/90 border border-[#2A1B14]/10 dark:border-white/10 p-7 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-[#D48464] transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black/30 border border-[#2A1B14]/10 dark:border-white/10 flex items-center justify-center text-[#D48464] mb-6 group-hover:scale-110 transition-transform">
                  <Timer size={24} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7E685D] dark:text-white/60 font-bold block mb-2">
                  AUDIT 02 · SOMATIC RESPIRATION
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2A1B14] dark:text-white mb-3">
                  BOLT Score & Vagus Nerve
                </h3>
                <p className="text-xs text-[#564238] dark:text-[#E6D7CD] leading-relaxed mb-6">
                  Clinical measurement of carbon dioxide tolerance, baroreceptor sensitivity, and vagal tone efferent strength through breath coordinates.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 text-[#2A1B14] dark:text-white/80">CO₂ Tolerance</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 text-[#2A1B14] dark:text-white/80">0.1 Hz HRV</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 text-[#2A1B14] dark:text-white/80">Vagal Pacing</span>
                </div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#D48464] flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                Measure BOLT Score <span>→</span>
              </div>
            </div>

            {/* Card 3: Hormonal & Lifestyle Restoration */}
            <div 
              onClick={() => openAudit('hormone')}
              className="bg-[#EFECE6]/90 dark:bg-[#251913]/90 border border-[#2A1B14]/10 dark:border-white/10 p-7 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-[#D48464] transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black/30 border border-[#2A1B14]/10 dark:border-white/10 flex items-center justify-center text-[#4D735D] mb-6 group-hover:scale-110 transition-transform">
                  <Dna size={24} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7E685D] dark:text-white/60 font-bold block mb-2">
                  AUDIT 03 · ENDOCRINE CURVE
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2A1B14] dark:text-white mb-3">
                  Hormonal Restoration
                </h3>
                <p className="text-xs text-[#564238] dark:text-[#E6D7CD] leading-relaxed mb-6">
                  Clinical evaluation of circadian diurnal cortisol, thyroid active T3 conversion, and autonomic sleep architecture integrity.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 text-[#2A1B14] dark:text-white/80">Cortisol Awakening</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 text-[#2A1B14] dark:text-white/80">Thyroid Axis</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 text-[#2A1B14] dark:text-white/80">Deep Wave</span>
                </div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#4D735D] flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                Take Hormone Audit <span>→</span>
              </div>
            </div>

            {/* Card 4: Sleep Architecture & STOP-BANG */}
            <div 
              onClick={() => openAudit('sleep')}
              className="bg-[#EFECE6]/90 dark:bg-[#251913]/90 border border-[#2A1B14]/10 dark:border-white/10 p-7 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-[#D48464] transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black/30 border border-[#2A1B14]/10 dark:border-white/10 flex items-center justify-center text-[#D48464] mb-6 group-hover:scale-110 transition-transform">
                  <Moon size={24} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7E685D] dark:text-white/60 font-bold block mb-2">
                  AUDIT 04 · AIRWAY RESILIENCE
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2A1B14] dark:text-white mb-3">
                  STOP-BANG Sleep Audit
                </h3>
                <p className="text-xs text-[#564238] dark:text-[#E6D7CD] leading-relaxed mb-6">
                  Clinical screening for nocturnal upper airway resistance, intermittent hypoxia, and sympathetic night surges.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 text-[#2A1B14] dark:text-white/80">Airway Collapse</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 text-[#2A1B14] dark:text-white/80">O2 Saturation</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/70 dark:bg-black/30 text-[#2A1B14] dark:text-white/80">Sleep Arousals</span>
                </div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#D48464] flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                Check Sleep Risk <span>→</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: "Breathe Now" SOMATIC FEATURE per Specification Sheet
          ========================================================================= */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        <div className="bg-[#2A1B14] text-[#FAF8F5] rounded-[3rem] p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden border border-[#D48464]/30">
          
          {/* Subtle Ambient Radial Light */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-radial from-[#D48464]/20 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-radial from-[#4D735D]/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Column: Titles and Controls */}
            <div className="lg:col-span-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D48464]/20 border border-[#D48464]/40 text-[#D48464] text-[10px] font-mono font-bold tracking-[0.2em] uppercase mb-4">
                SOMATIC FEATURE
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight text-white mb-2">
                "Breathe Now"
              </h2>
              <p className="text-xl sm:text-2xl font-serif italic text-[#D48464] mb-4">
                Somatic Feature
              </p>
              
              <p className="text-sm sm:text-base text-[#E2CEC4] leading-relaxed max-w-lg mb-8">
                Visual guided 4-7-8 breathing pacer. 4s gentle inhale, 7s oxygen suspension, 8s slow vagal exhale. Reset your autonomic nervous system in real time through clinical vagal entrainment.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button
                  onClick={toggleHomeBreathe}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#D48464] to-[#E09273] hover:scale-105 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#D48464]/40 transition-all cursor-pointer flex items-center gap-2.5"
                >
                  {isBreatheActive ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
                  <span>{isBreatheActive ? 'PAUSE 4-7-8 SESSION' : 'BREATHE NOW (4-7-8)'}</span>
                </button>

                <button
                  onClick={resetHomeBreathe}
                  className="px-4 py-4 rounded-full border border-white/20 hover:bg-white/10 text-white transition-all cursor-pointer"
                  title="Reset counter"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Telemetry Indicator */}
              <div className="flex items-center gap-6 pt-4 border-t border-white/10 text-xs font-mono text-[#E2CEC4]">
                <div>
                  <span className="text-[10px] text-white/50 block">CYCLES COMPLETED</span>
                  <strong className="text-lg font-bold text-[#D48464]">{breatheCycles}</strong>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <span className="text-[10px] text-white/50 block">CADENCE TARGET</span>
                  <strong className="text-sm font-bold text-white">4s Inhale · 7s Hold · 8s Exhale</strong>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/breathe"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D48464] hover:text-white transition-colors"
                >
                  <span>Open Full Sanctuary with Ambient AI Video Atmospheres</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Column: ORGANIC ORB WIDGET WITH "4-7-8" PER SNAPSHOT */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="relative w-72 sm:w-88 h-72 sm:h-88 flex items-center justify-center">
                
                {/* Organic Liquid Aura */}
                <motion.div
                  animate={{
                    scale: isBreatheActive
                      ? breathePhase === 'inhale' ? [1, 1.45]
                        : breathePhase === 'hold' ? 1.45
                        : [1.45, 1]
                      : [1, 1.08, 1],
                    opacity: isBreatheActive ? 0.7 : 0.3
                  }}
                  transition={{
                    duration: isBreatheActive ? (breathePhase === 'inhale' ? 4 : breathePhase === 'hold' ? 7 : 8) : 3,
                    ease: "easeInOut",
                    repeat: isBreatheActive ? 0 : Infinity
                  }}
                  className="absolute inset-0 rounded-full bg-radial from-[#D48464]/30 via-[#D48464]/10 to-transparent blur-2xl pointer-events-none"
                />

                {/* Rotating concentric fluid lines */}
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: isBreatheActive
                      ? breathePhase === 'inhale' ? [1, 1.25]
                        : breathePhase === 'hold' ? 1.25
                        : [1.25, 1]
                      : 1.05
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: isBreatheActive ? (breathePhase === 'inhale' ? 4 : breathePhase === 'hold' ? 7 : 8) : 2, ease: "easeInOut" }
                  }}
                  className="absolute inset-4 border border-[#D48464]/35 rounded-full"
                />
                
                <motion.div
                  animate={{
                    rotate: [360, 0],
                    scale: isBreatheActive
                      ? breathePhase === 'inhale' ? [1, 1.15]
                        : breathePhase === 'hold' ? 1.15
                        : [1.15, 1]
                      : 1.0
                  }}
                  transition={{
                    rotate: { duration: 28, repeat: Infinity, ease: "linear" },
                    scale: { duration: isBreatheActive ? (breathePhase === 'inhale' ? 4 : breathePhase === 'hold' ? 7 : 8) : 2, ease: "easeInOut" }
                  }}
                  className="absolute inset-10 border border-dashed border-[#D48464]/25 rounded-full"
                />

                {/* The Central Organic Orb */}
                <motion.div
                  animate={{
                    scale: isBreatheActive
                      ? breathePhase === 'inhale' ? [1, 1.3]
                        : breathePhase === 'hold' ? 1.3
                        : [1.3, 1]
                      : [1, 1.05, 1],
                    borderRadius: isBreatheActive
                      ? ["50%", "45% 55% 52% 48% / 54% 48% 52% 46%", "50%"]
                      : "50%"
                  }}
                  transition={{
                    duration: isBreatheActive ? (breathePhase === 'inhale' ? 4 : breathePhase === 'hold' ? 7 : 8) : 3,
                    ease: "easeInOut",
                    repeat: isBreatheActive ? 0 : Infinity
                  }}
                  onClick={toggleHomeBreathe}
                  className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-[#1D120C] via-[#3A2218] to-[#543021] border-2 border-[#D48464] shadow-[0_0_50px_rgba(212,132,100,0.45)] flex flex-col items-center justify-center cursor-pointer p-4 select-none hover:border-white transition-colors"
                >
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#D48464] font-bold block mb-1">
                    {isBreatheActive ? (breathePhase === 'inhale' ? 'INHALE' : breathePhase === 'hold' ? 'HOLD O2' : 'SLOW EXHALE') : 'SOMATIC CADENCE'}
                  </span>
                  
                  {/* Center "4-7-8" exactly as shown in snapshot */}
                  <span className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-white block my-1">
                    {isBreatheActive ? breatheSeconds : '4-7-8'}
                  </span>

                  <span className="text-[9px] font-sans uppercase tracking-widest text-[#E2CEC4] font-bold block">
                    {isBreatheActive ? 'VAGAL ENTRAINMENT' : 'CLICK TO START'}
                  </span>
                </motion.div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: THE RESET METHODOLOGY (Clinical Evolution)
          ========================================================================= */}
      <section id="method" className="py-20 md:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#2A1B14]/10 dark:border-white/10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 text-left">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D48464] font-bold block mb-3">
              THE RESET METHODOLOGY
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif text-[#2A1B14] dark:text-white mb-6 tracking-tight leading-tight">
              A clinical protocol that <em>evolves</em> with you.
            </h2>
            <p className="text-base text-[#564238] dark:text-[#E6D7CD] leading-relaxed mb-8">
              Care shouldn't sit still. Yours adapts as your labs, hormonal status, and lifestyle shift through precision biometric feedback.
            </p>
            <button
              onClick={() => navigate('/booking')}
              className="px-8 py-3.5 rounded-full bg-[#2A1B14] text-white dark:bg-white dark:text-[#2A1B14] text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              Consult Clinical Specialist →
            </button>
          </div>

          <div className="lg:col-span-7 space-y-4 text-left">
            {[
              { letter: 'R', title: 'Reports-Led Precision', desc: 'Scan up to 50 active molecular biomarkers to track hormonal and metabolic pathways without guesswork.' },
              { letter: 'E', title: 'Element Nutrition', desc: 'Direct-feed microelement nutrients and anti-inflammatory polyphenol density tailored to cellular labs.' },
              { letter: 'S', title: 'Somatic Breath Pacing', desc: 'Integrated 4-7-8 and resonance regulators that lower serum cortisol and stabilize autonomic HRV.' },
              { letter: 'E', title: 'Evaluation Loop', desc: 'Biweekly biometric clinical evaluations ensuring continuous metabolic recalibration.' },
              { letter: 'T', title: 'Transcendence Goal', desc: 'Sustained metabolic flexibility, deep cellular resilience, and restorative energetic freedom.' }
            ].map((step, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#EFECE6]/85 dark:bg-[#251913]/85 backdrop-blur-sm border border-[#2A1B14]/10 dark:border-white/10 flex items-start gap-4 hover:border-[#D48464] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-black/30 font-serif font-black text-xl text-[#D48464] flex items-center justify-center shrink-0 border border-[#2A1B14]/10 dark:border-white/10">
                  {step.letter}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#2A1B14] dark:text-white mb-1">
                    {step.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#564238] dark:text-[#E6D7CD] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: INTELLIGENT CLINICAL AI LAB COMPANION
          ========================================================================= */}
      <section id="ai-lab" className="py-20 md:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#2A1B14]/10 dark:border-white/10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          
          <div className="lg:col-span-5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D48464] font-bold block mb-3">
              INTELLIGENT LAB COMPANION
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif text-[#2A1B14] dark:text-white mb-6 tracking-tight leading-tight">
              Clinical knowledge, <em>amplified by AI</em>.
            </h2>
            <p className="text-base text-[#564238] dark:text-[#E6D7CD] leading-relaxed mb-6">
              A thoughtful clinical toolkit for my community — query any biomarker, simulate cycle-synced nutrition, or decode autonomic nervous system cues.
            </p>
            <div className="p-4 rounded-2xl bg-[#EFECE6]/85 dark:bg-[#251913]/85 backdrop-blur-sm border border-[#2A1B14]/10 text-xs text-[#564238] dark:text-[#E6D7CD] space-y-2">
              <p>✓ <strong>Biomarker Translator</strong>: Converts clinical labs into plain language</p>
              <p>✓ <strong>Circadian Sync</strong>: Meal timing aligned with solar glucose absorption</p>
              <p>✓ <strong>Somatic Diagnostics</strong>: Personalized 4-7-8 breathing recommendations</p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white/90 dark:bg-[#251913]/90 backdrop-blur-md border border-[#2A1B14]/12 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A1B14]/10 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D48464] animate-pulse"></span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2A1B14] dark:text-white">
                  Reshmi's Clinical AI Assistant
                </span>
              </div>
              <div className="flex gap-1.5">
                {(['assistant', 'meal', 'symptom'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setChatMode(mode)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      chatMode === mode 
                        ? 'bg-[#2A1B14] text-white dark:bg-white dark:text-[#2A1B14]' 
                        : 'bg-[#EFECE6] dark:bg-[#1D130E] text-[#564238] dark:text-[#E6D7CD]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-60 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                    msg.role === 'bot' 
                      ? 'bg-[#EFECE6] dark:bg-[#1D130E] text-[#2A1B14] dark:text-[#FAF8F5] mr-auto' 
                      : 'bg-[#D48464] text-white ml-auto font-medium'
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
                className="flex-1 px-4 py-3 rounded-full bg-[#FAF8F5] dark:bg-[#1A110D] border border-[#2A1B14]/15 dark:border-white/15 text-xs text-[#2A1B14] dark:text-white focus:outline-none focus:border-[#D48464]"
              />
              <button
                onClick={handleSendChat}
                className="px-6 py-3 rounded-full bg-[#2A1B14] dark:bg-[#D48464] text-white text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6: CLINICAL COMMUNITY & INSTAGRAM REELS
          ========================================================================= */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#2A1B14]/10 dark:border-white/10 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 text-left">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D48464] font-bold block mb-2">
              CLINICAL COMMUNITY
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif text-[#2A1B14] dark:text-white tracking-tight">
              Daily Insights on <em>Instagram</em>.
            </h2>
            <p className="text-sm text-[#564238] dark:text-[#E6D7CD] mt-2">
              Bite-sized functional nutrition and somatic breathwork education shared with @fitwithreshmi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => reelsScrollRef.current?.scrollBy({ left: -260, behavior: 'smooth' })}
              className="p-3 rounded-full border border-[#2A1B14]/20 hover:bg-[#EFECE6] text-[#2A1B14] dark:text-white transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => reelsScrollRef.current?.scrollBy({ left: 260, behavior: 'smooth' })}
              className="p-3 rounded-full border border-[#2A1B14]/20 hover:bg-[#EFECE6] text-[#2A1B14] dark:text-white transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div ref={reelsScrollRef} className="flex gap-6 overflow-x-auto pb-6 scrollbar-none text-left">
          {reels.map((reel, idx) => (
            <a
              key={reel.id || idx}
              href={reel.instagramUrl || "https://instagram.com/fitwithreshmi"}
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 w-64 aspect-[9/15] rounded-[2rem] overflow-hidden bg-black relative group shadow-md hover:shadow-2xl transition-all"
            >
              {reel.video_url ? (
                <video
                  src={reel.video_url}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <img
                  src={reel.thumbnail}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-5 inset-x-5 text-white">
                <span className="text-[10px] font-mono text-[#D48464] uppercase font-bold block mb-1">
                  @fitwithreshmi
                </span>
                <h4 className="font-serif text-sm font-bold line-clamp-2 leading-snug">
                  {reel.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-white/80 mt-2 font-mono">
                  <span className="flex items-center gap-1"><Play size={10} className="fill-current" /> Watch</span>
                  <span>{reel.views || "12.4k"} views</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: FINAL PREMIUM CTA & CLINICAL FOOTER
          ========================================================================= */}
      <footer className="py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-[#EFECE6]/90 dark:bg-[#1D130E]/90 backdrop-blur-md border-t border-[#2A1B14]/10 dark:border-white/10 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#D48464] font-bold block mb-4">
            BEGIN YOUR PROTOCOL
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-[#2A1B14] dark:text-white tracking-tight mb-6">
            Ready to experience <em>sustainable vitality</em>?
          </h2>
          <p className="text-base sm:text-lg text-[#564238] dark:text-[#E6D7CD] max-w-xl mx-auto mb-10 leading-relaxed">
            Schedule a comprehensive clinical assessment with Reshmi Verma to decode multi-system laboratory data and restore autonomic balance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/booking')}
              className="px-8 py-4 rounded-full bg-[#2A1B14] text-white dark:bg-white dark:text-[#2A1B14] text-xs font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              Book 1:1 Consultation →
            </button>
            <button
              onClick={() => {
                const hub = document.getElementById('audit-hub');
                if (hub) hub.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-full border border-[#2A1B14]/30 dark:border-white/30 text-[#2A1B14] dark:text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2A1B14]/5 transition-all cursor-pointer"
            >
              Take Free Assessment
            </button>
          </div>

          <div className="pt-10 border-t border-[#2A1B14]/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#7E685D] dark:text-white/60">
            <div>
              Reshmi Verma · Director, Rainbow Medinova · Co-Founder, Neofit Gym
            </div>
            <div>
              © {new Date().getFullYear()} Reshmi Verma. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          INTERACTIVE DIAGNOSTIC AUDIT MODAL
          ========================================================================= */}
      <AnimatePresence>
        {activeAuditType && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FAF8F5] dark:bg-[#1D130E] border-2 border-[#D48464] rounded-[2.5rem] max-w-xl w-full p-6 sm:p-10 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setActiveAuditType(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/10 text-[#564238] dark:text-white transition-colors"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>

              {!auditComplete ? (
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D48464]/15 text-[#D48464] text-[10px] font-mono font-bold uppercase mb-3">
                    Question {auditStep + 1} of {AUDIT_QUESTIONS[activeAuditType].questions.length}
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#2A1B14] dark:text-white mb-2">
                    {AUDIT_QUESTIONS[activeAuditType].title}
                  </h3>
                  <p className="text-xs text-[#564238] dark:text-[#E6D7CD] mb-8">
                    {AUDIT_QUESTIONS[activeAuditType].subtitle}
                  </p>

                  <h4 className="font-serif font-bold text-lg text-[#2A1B14] dark:text-white mb-6">
                    {AUDIT_QUESTIONS[activeAuditType].questions[auditStep].question}
                  </h4>

                  <div className="space-y-3 mb-6">
                    {AUDIT_QUESTIONS[activeAuditType].questions[auditStep].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAuditAnswer(opt.points)}
                        className="w-full text-left p-4 rounded-2xl bg-[#EFECE6] dark:bg-[#251913] hover:bg-[#D48464] hover:text-white border border-[#2A1B14]/10 transition-all font-sans text-xs sm:text-sm font-medium text-[#2A1B14] dark:text-white cursor-pointer"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="w-full bg-[#EFECE6] dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#D48464] h-full transition-all duration-300"
                      style={{ width: `${((auditStep + 1) / AUDIT_QUESTIONS[activeAuditType].questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-[#D48464]/15 text-[#D48464] mx-auto flex items-center justify-center mb-4">
                    <Check size={32} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#7E685D] font-bold block mb-1">
                    AUDIT COMPLETED · BASELINE INDEX
                  </span>
                  <h3 className="font-serif text-4xl font-black text-[#2A1B14] dark:text-white mb-2">
                    Score: {calculateAuditScore()} / 100
                  </h3>
                  <p className="text-sm text-[#564238] dark:text-[#E6D7CD] max-w-md mx-auto mb-8">
                    {calculateAuditScore() >= 80 
                      ? "High functional balance with minor subclinical optimization opportunities. Excellent foundation for advanced performance."
                      : calculateAuditScore() >= 55
                      ? "Moderate autonomic or metabolic drag detected. Indicates sympathetic compensation and digestive permeability that responds rapidly to functional nutritional protocols."
                      : "Significant autonomic and metabolic dysregulation flagged. Prioritizing 4-7-8 vagal entrainment and clinical biomarker review is strongly indicated."}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        setActiveAuditType(null);
                        navigate('/booking');
                      }}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#D48464] text-white text-xs font-bold uppercase tracking-widest shadow-lg cursor-pointer hover:scale-105 transition-transform"
                    >
                      Book 1:1 Clinical Consult →
                    </button>
                    <button
                      onClick={() => {
                        setActiveAuditType(null);
                        navigate('/breathe');
                      }}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[#2A1B14] dark:border-white text-[#2A1B14] dark:text-white text-xs font-bold uppercase tracking-widest hover:bg-black/5 cursor-pointer transition-colors"
                    >
                      Practice 4-7-8 Breathwork
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
