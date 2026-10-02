import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { INSTAGRAM_REELS } from "../lib/data";
import { Activity, Play, Eye, Heart, MessageCircle, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../lib/theme";
import "../styles-design.css";

export default function Home() {
  const navigate = useNavigate();
  const [activeScene, setActiveScene] = useState(0);
  const { mode, style, isDark } = useTheme();
  const [pillar, setPillar] = useState(0);
  const [reels, setReels] = useState<any[]>(INSTAGRAM_REELS);
  const reelsScrollRef = useRef<HTMLDivElement>(null);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({
    hero_title: 'Reshmi Verma',
    hero_subtitle: 'Functional Nutritionist & Breathwork Specialist',
    tagline: 'Prevent. Optimise. Bio-harmonise.',
    banner_announcement: ''
  });

  const scrollerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Load dynamic site settings and reels from backend
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSiteSettings(prev => ({ ...prev, ...data.settings }));
        }
      })
      .catch(err => console.log('Using default settings in Home:', err));

    fetch('/api/reels')
      .then(res => res.json())
      .then(data => {
        if (data.reels && data.reels.length > 0) {
          setReels(data.reels);
        }
      })
      .catch(err => console.log('Using fallback reels in Home:', err));
  }, []);

  // Switch Theme effect
  useEffect(() => {
    // ensure body has neo-body
    document.body.classList.add("neo-body");
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove("neo-body");
      document.body.style.overflow = "";
    };
  }, []);

  // Cursor Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = e.clientX + "px";
        glowRef.current.style.top = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Intersection Observer for scenes
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const scenes = Array.from(scroller.querySelectorAll(".scene"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.intersectionRatio >= 0.55) {
            const i = Number((e.target as HTMLElement).dataset.scene);
            setActiveScene(i);
            document.body.className = `neo-body scene-${i}`;
          }
        });
      },
      { root: scroller, threshold: [0.55] },
    );

    scenes.forEach((s) => observer.observe(s));

    // Auto-rotate pillars
    const pillarInterval = setInterval(() => {
      if (document.body.classList.contains("scene-1")) {
        setPillar((prev) => (prev + 1) % 3);
      }
    }, 4000);

    return () => {
      observer.disconnect();
      clearInterval(pillarInterval);
    };
  }, []);

  const goToScene = (i: number) => {
    if (scrollerRef.current) {
      const scenes = scrollerRef.current.querySelectorAll(".scene");
      if (scenes[i]) {
        scenes[i].scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Chat Simulator State
  const [chatMode, setChatMode] = useState<"assistant" | "meal" | "symptom">(
    "assistant",
  );
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "bot",
      text: "Hi, I'm Reshmi's Wellness Assistant 🌿 Ask me anything about nutrition, hormones, energy or gut health.",
    },
  ]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newHistory = [...chatHistory, { role: "user", text: chatInput }];
    setChatHistory(newHistory);
    setChatInput("");

    setTimeout(() => {
      setChatHistory([
        ...newHistory,
        {
          role: "bot",
          text: `This is a preview response in the ${chatMode} mode. Please visit our full AI Lab to get deep analytical insights into your queries.`,
        },
      ]);
    }, 1000);
  };

  return (
    <>
      <div className="stage">
        <div className="blob" id="bJade"></div>
        <div className="blob" id="bCoral"></div>
        <div className="blob" id="bGold"></div>
      </div>
      <div className="field"></div>
      <div className="grain"></div>
      <div className="cursor-glow" id="cursorGlow" ref={glowRef}></div>

      {/* scene rail */}
      <div className="rail" id="rail">
        <button
          onClick={() => goToScene(0)}
          className={activeScene === 0 ? "on" : ""}
        >
          <span className="lb">Welcome</span>
          <span className="tk"></span>
        </button>
        <button
          onClick={() => goToScene(1)}
          className={activeScene === 2 ? "on" : ""}
        >
          <span className="lb">Programs</span>
          <span className="tk"></span>
        </button>
        <button
          onClick={() => goToScene(2)}
          className={activeScene === 3 ? "on" : ""}
        >
          <span className="lb">Practice</span>
          <span className="tk"></span>
        </button>
        <button
          onClick={() => goToScene(3)}
          className={activeScene === 4 ? "on" : ""}
        >
          <span className="lb">Method</span>
          <span className="tk"></span>
        </button>
        <button
          onClick={() => goToScene(4)}
          className={activeScene === 5 ? "on" : ""}
        >
          <span className="lb">Diagnostics</span>
          <span className="tk"></span>
        </button>
        <button
          onClick={() => goToScene(6)}
          className={activeScene === 6 ? "on" : ""}
        >
          <span className="lb">Legacy</span>
          <span className="tk"></span>
        </button>
        <button
          onClick={() => goToScene(6)}
          className={activeScene === 7 ? "on" : ""}
        >
          <span className="lb">AI Lab</span>
          <span className="tk"></span>
        </button>
        <button
          onClick={() => goToScene(7)}
          className={activeScene === 7 ? "on" : ""}
        >
          <span className="lb">Community</span>
          <span className="tk"></span>
        </button>
        <button
          onClick={() => goToScene(8)}
          className={activeScene === 8 ? "on" : ""}
        >
          <span className="lb">Begin</span>
          <span className="tk"></span>
        </button>
      </div>

      <main className="scroller" id="scroller" ref={scrollerRef}>
        {/* ===== SCENE 0 · HERO ===== */}
        <section
          className={`scene ${activeScene === 0 ? "active" : ""}`}
          data-scene="0"
        >
          <div className="scene-index">
            <b>00</b>
            <span className="ln"></span> Welcome
          </div>
          <div className="inner hero">
            <div className="hero-grid">
              <div>
                {siteSettings.banner_announcement && (
                  <div className="mb-4 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFE8DC] text-[#170702] text-xs font-bold uppercase tracking-wider border-2 border-[var(--jade)] shadow-md animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--jade)] shadow-[0_0_8px_var(--jade)]"></span>
                    <span className="font-extrabold tracking-wide">{siteSettings.banner_announcement}</span>
                  </div>
                )}
                <div className="hero-tag up">
                  <span className="dot"></span> {siteSettings.hero_subtitle || "Functional Nutritionist & Breathwork Specialist"}
                </div>
                <h1 className="up d1">
                  Health is
                  <br />
                  <em>Freedom.</em>
                  <span className="nm">
                    — {siteSettings.tagline || "Prevent. Optimise. Bio-harmonise."}
                  </span>
                </h1>
                <p className="intro up d2">
                  I'm {siteSettings.hero_title || "Reshmi Verma"}, Director of Rainbow Medinova & Co-Founder of
                  Neofit Gym. My approach decodes multi-system physiological and
                  clinical data beyond superficial symptoms, blending functional
                  dietetics with somatic breathwork interventions.
                </p>
                <div className="hero-actions up d3">
                  <button
                    className="neo-btn btn-primary"
                    onClick={() => navigate("/booking")}
                  >
                    Start your journey →
                  </button>
                  <button
                    className="neo-btn btn-ghost"
                    onClick={() => goToScene(6)}
                  >
                    ✦ Explore the AI Lab
                  </button>
                </div>
                <div className="hero-stats up d4">
                  <div>
                    <div className="n">50+</div>
                    <div className="l">Biomarkers Tracked</div>
                  </div>
                  <div>
                    <div className="n">17+</div>
                    <div className="l">Years in practice</div>
                  </div>
                  <div>
                    <div className="n">35kg</div>
                    <div className="l">Healed Weight Loss</div>
                  </div>
                </div>
              </div>
              <div className="portrait-wrap up d2">
                <div className="portrait">
                  <div className="halo"></div>
                  <img
                    src="/IMG_5514-scaled-e1762270577699.jpg"
                    alt="Reshmi Verma"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="float-card fc1">
                  <div className="t">Metabolic</div>
                  <div className="s">Longevity & Strength</div>
                </div>
                <div className="float-card fc2">
                  <div className="t">Clinical</div>
                  <div className="s">Bio-Harmonisation</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        {/* ===== SCENE 1 · BRANDS ===== */}
        <section
          className={`scene ${activeScene === 1 ? "active" : ""}`}
          data-scene="1"
        >
          <div className="scene-index">
            <b>01</b>
            <span className="ln"></span> The Brands
          </div>
          <div className="inner relative z-10 w-full max-w-5xl mx-auto flex flex-col justify-center min-h-[60vh]">
            <span className="eyebrow up" style={{ marginLeft: 'auto', marginRight: 'auto', display: 'flex', width: 'fit-content' }}>Our Brands</span>
            <h2 className="neo-title up d1 text-center" style={{ marginBottom: 40 }}>
              Specialised <em>Pathways</em>.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 up d2">
              <div className="bg-[var(--surface-card)] border-1.5 border-[var(--glass-line)] p-7 rounded-[28px] hover:border-[var(--jade)] hover:shadow-xl transition-all group cursor-pointer backdrop-blur-md shadow-sm flex flex-col justify-between" onClick={() => goToScene(2)}>
                 <div>
                   <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)] mb-2 block">PATHWAY 01</span>
                   <h3 className="text-2xl font-[var(--serif)] font-medium text-[var(--jade)] mb-3 group-hover:scale-[1.02] transition-transform origin-left">Fit with Reshmi</h3>
                   <p className="text-[var(--muted)] text-sm font-normal leading-relaxed mb-6">
                     Clinical movement and metabolic conditioning. Address the root cause of chronic inflammation, postural stagnation, and physical resilience.
                   </p>
                 </div>
                 <div className="text-xs font-bold uppercase tracking-widest text-[var(--ink)] flex items-center gap-2 group-hover:text-[var(--jade)] transition-colors">
                    Explore Practice <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                 </div>
              </div>
              <div className="bg-[var(--surface-card)] border-1.5 border-[var(--glass-line)] p-7 rounded-[28px] hover:border-[var(--jade)] hover:shadow-xl transition-all group cursor-pointer backdrop-blur-md shadow-sm flex flex-col justify-between relative overflow-hidden" onClick={() => navigate('/breathe')}>
                 <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-[var(--jade)]/10 border border-[var(--jade)]/30 text-[9px] font-mono font-bold text-[var(--jade)]">
                   4-7-8 Somatic
                 </div>
                 <div>
                   <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)] mb-2 block">PATHWAY 02</span>
                   <h3 className="text-2xl font-[var(--serif)] font-medium text-[var(--jade)] mb-3 group-hover:scale-[1.02] transition-transform origin-left">Breathe with Reshmi</h3>
                   <p className="text-[var(--muted)] text-sm font-normal leading-relaxed mb-6">
                     Somatic regulation and autonomic vagal recovery. Guided 4-7-8 cadence breathwork with interactive organic orb and ambient soundscapes to restore neurological calm.
                   </p>
                 </div>
                 <div className="text-xs font-bold uppercase tracking-widest text-[var(--ink)] flex items-center gap-2 group-hover:text-[var(--jade)] transition-colors">
                    Breathe Now (4-7-8) <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                 </div>
              </div>
              <div className="bg-[var(--surface-card)] border-1.5 border-emerald-500/30 hover:border-emerald-500 p-7 rounded-[28px] hover:shadow-xl transition-all group cursor-pointer backdrop-blur-md shadow-sm flex flex-col justify-between relative overflow-hidden" onClick={() => navigate('/nutrition')}>
                 <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                   NEW
                 </div>
                 <div>
                   <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 block">PATHWAY 03</span>
                   <h3 className="text-2xl font-[var(--serif)] font-medium text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-[1.02] transition-transform origin-left">Nutrition with Reshmi</h3>
                   <p className="text-[var(--muted)] text-sm font-normal leading-relaxed mb-6">
                     Futuristic cellular biochemistry, gut microbiome alchemy, and circadian chrono-nutrition designed around your unique biological markers.
                   </p>
                 </div>
                 <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    Explore Nutritive Alchemy <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SCENE 2 · PRACTICE ===== */}
        <section
          className={`scene ${activeScene === 2 ? "active" : ""}`}
          data-scene="2"
        >
          <div className="scene-index">
            <b>02</b>
            <span className="ln"></span> The Practice
          </div>
          <div className="inner">
            <div className="switch">
              <div>
                <span className="eyebrow up">Bio-Hacking Pillars</span>
                <h2 className="neo-title up d1" style={{ marginBottom: 30 }}>
                  One <em>thriving you</em>.
                </h2>
                <div className="switch-list up d2">
                  <button
                    className={`switch-item ${pillar === 0 ? "on" : ""}`}
                    onClick={() => setPillar(0)}
                  >
                    <h4>Hormonal Optimisation</h4>
                    <p>
                      Decoding clinical thyroid pathways, glucose curves,
                      functional insulin thresholds, and sex hormones.
                    </p>
                  </button>
                  <button
                    className={`switch-item ${pillar === 1 ? "on" : ""}`}
                    onClick={() => setPillar(1)}
                  >
                    <h4>Gut Reset & Protection</h4>
                    <p>
                      Strengthening stomach-lining immunity and microbial
                      diversity to improve digestion and brain
                      neurotransmitters.
                    </p>
                  </button>
                  <button
                    className={`switch-item ${pillar === 2 ? "on" : ""}`}
                    onClick={() => setPillar(2)}
                  >
                    <h4>Metabolic Longevity</h4>
                    <p>
                      Unlocking cellular flexibility to process glucose and fats
                      efficiently, ensuring a robust immune system.
                    </p>
                  </button>
                </div>
              </div>
              <div className="switch-panel up d2">
                <div className={`panel-face f0 ${pillar === 0 ? "on" : ""}`}>
                  <div className="pico">
                    <Activity />
                  </div>
                  <h3>Hormonal Optimisation</h3>
                  <p>
                    Restoring deep baseline energy pathways by addressing
                    hormone imbalances, thyroid function, and insulin resistance
                    without synthetic overmedication.
                  </p>
                  <div className="tags">
                    <span>Thyroid</span>
                    <span>Glucose</span>
                    <span>Insulin Levels</span>
                    <span>Cortisol</span>
                  </div>
                </div>
                <div className={`panel-face f1 ${pillar === 1 ? "on" : ""}`}>
                  <div className="pico">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.6"
                      stroke="currentColor"
                    >
                      <path d="M12 3c0 4-3 5-3 9a3 3 0 006 0c0-4-3-5-3-9z" />
                      <path d="M5 14c2 1 3 3 3 6M19 14c-2 1-3 3-3 6" />
                    </svg>
                  </div>
                  <h3>Gut Reset & Protection</h3>
                  <p>
                    True healing starts with strengthening the
                    gut-immune-barrier interface to improve digestion, clear
                    skin flareups, and enhance brain neurotransmitters.
                  </p>
                  <div className="tags">
                    <span>Microbiome</span>
                    <span>Digestion</span>
                    <span>Immunity</span>
                  </div>
                </div>
                <div className={`panel-face f2 ${pillar === 2 ? "on" : ""}`}>
                  <div className="pico">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.6"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="8" r="3.4" />
                      <path d="M5 21c0-4 3-6 7-6s7 2 7 6" />
                    </svg>
                  </div>
                  <h3>Metabolic Longevity</h3>
                  <p>
                    Unlocking deep physiological vitality. By shifting habit
                    loops and training mitochondria, we secure a robust immune
                    system and structural longevity.
                  </p>
                  <div className="tags">
                    <span>Energy</span>
                    <span>Fat-loss</span>
                    <span>Longevity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SCENE 3 · METHOD ===== */}
        <section
          className={`scene ${activeScene === 3 ? "active" : ""}`}
          data-scene="3"
        >
          <div className="scene-index">
            <b>03</b>
            <span className="ln"></span> The Method
          </div>
          <div className="inner">
            <div className="method">
              <div>
                <span className="eyebrow up">The RESET Methodology</span>
                <h2 className="neo-title up d1" style={{ marginBottom: 14 }}>
                  A protocol that <em>evolves</em> with you.
                </h2>
                <p className="lead up d2" style={{ marginBottom: 26 }}>
                  Care shouldn't sit still. Yours adapts as your body, labs and
                  life shift.
                </p>
                <div
                  className="up d3"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <div className="step">
                    <div className="num">R</div>
                    <div>
                      <h4>Reports-Led Precision</h4>
                      <p>
                        We scan up to 50 active molecular biomarkers to track
                        hormonal pathways.
                      </p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="num">E</div>
                    <div>
                      <h4>Element Nutrition</h4>
                      <p>
                        No restrictive calorie starve loops. Direct-feed
                        microelement nutrients.
                      </p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="num">S</div>
                    <div>
                      <h4>Somatic Breath pacing</h4>
                      <p>
                        Integrated regulators that manage cortisol and Heart
                        Rate Variability.
                      </p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="num">E</div>
                    <div>
                      <h4>Evaluation Loop</h4>
                      <p>
                        Biweekly biometric clinical testing ensuring safe path
                        deviations.
                      </p>
                    </div>
                  </div>
                  <div
                    className="step"
                    style={{ borderBottom: "none", paddingBottom: 0 }}
                  >
                    <div className="num">T</div>
                    <div>
                      <h4>Transcendence Goal</h4>
                      <p>
                        Metabolic flexibility and biological fat-loss retention.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="method-visual up d2">
                <div className="orbits">
                  <div className="ring r-a">
                    <span className="node"></span>
                  </div>
                  <div className="ring r-b">
                    <span className="node"></span>
                  </div>
                  <div className="ring r-c">
                    <span className="node"></span>
                  </div>
                </div>
                <div className="core">
                  You at
                  <br />
                  the centre
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SCENE 4 · DIAGNOSTICS ===== */}
        <section
          className={`scene ${activeScene === 4 ? "active" : ""}`}
          data-scene="4"
        >
          <div className="scene-index">
            <b>04</b>
            <span className="ln"></span> Diagnostics
          </div>
          <div className="inner">
            <span className="eyebrow up">The Missing Link</span>
            <h2 className="neo-title up d1">
              Are your labs truly <em>optimal</em>?
            </h2>
            <p className="lead up d2 mb-8">
              We deploy bloodwork-led, lifestyle-aligned strategies that work
              with your unique cellular chemistry, targeting functional
              precision.
            </p>
            <div className="bio-grid up d3">
              <div className="bio-card">
                <h4>
                  Fasting Insulin<span>µIU/mL</span>
                </h4>
                <p>
                  Direct driver of metabolic health, silent cellular
                  inflammation, sleep quality, and sugar crashes. We target &lt;
                  5 µIU/mL.
                </p>
              </div>
              <div className="bio-card">
                <h4>
                  Active Thyroid (TSH)<span>µIU/mL</span>
                </h4>
                <p>
                  The master regulator of baseline metabolic output, cognitive
                  energy, and hormone feedback loops.
                </p>
              </div>
              <div className="bio-card">
                <h4>
                  Ferritin<span>ng/mL</span>
                </h4>
                <p>
                  The cellular iron battery that direct-fuels oxygen transport
                  and mitochondrial energy (ATP) generation.
                </p>
              </div>
              <div className="bio-card">
                <h4>
                  Active Vitamin D3<span>ng/mL</span>
                </h4>
                <p>
                  A structural hormone that governs cellular genetic
                  transcription and multi-organ immune response.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SCENE 5 · LEGACY ===== */}
        <section
          className={`scene ${activeScene === 5 ? "active" : ""}`}
          data-scene="5"
        >
          <div className="scene-index">
            <b>05</b>
            <span className="ln"></span> Legacy
          </div>
          <div className="inner">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="eyebrow up">Clinical Ecosystem</span>
                <h2 className="neo-title up d1">
                  Not just an app.
                  <br />A 27-Year <em>Legacy</em>.
                </h2>
                <p className="lead up d2">
                  Born from Rainbow Medinova, our programs are grounded in
                  decades of diagnostic breakthroughs, from nuclear imaging to
                  next-gen metabolic testing.
                </p>
              </div>
              <div className="legacy-list up d3">
                <div className="legacy-item">
                  <h4>
                    Nuclear Medicine Pioneer <span>1998</span>
                  </h4>
                  <p>
                    First comprehensive diagnostic nuclear imaging facility
                    established in the region.
                  </p>
                </div>
                <div className="legacy-item">
                  <h4>
                    Automated Molecular Pathology <span>2021</span>
                  </h4>
                  <p>
                    Launched a fully automated liquid-handling array for
                    error-free biochemical tracking.
                  </p>
                </div>
                <div className="legacy-item">
                  <h4>
                    Visceral Fat DEXA Scanners <span>2023</span>
                  </h4>
                  <p>
                    Pioneered precision body composition diagnostics and ectopic
                    fat mapping.
                  </p>
                </div>
                <div className="legacy-item">
                  <h4>
                    Next-Gen Hyperbaric AC HBOT <span>2025</span>
                  </h4>
                  <p>
                    Launched multi-seater climate clinical HBOT and pelvic floor
                    nervous stimulation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SCENE 6 · AI LAB ===== */}
        <section
          className={`scene ${activeScene === 6 ? "active" : ""}`}
          data-scene="6"
        >
          <div className="scene-index">
            <b>06</b>
            <span className="ln"></span> The AI Lab
          </div>
          <div className="inner">
            <div className="lab-grid">
              <div>
                <span className="eyebrow up">The AI Lab</span>
                <h2 className="neo-title up d1" style={{ marginBottom: 14 }}>
                  Your wellness, <em>amplified by AI</em>.
                </h2>
                <p className="lead up d2">
                  A living toolkit for my community — ask anything, generate
                  cycle-synced meals, or explore what your symptoms might be
                  telling you. Thoughtful tech, in service of your body.
                </p>
                <div className="lab-soon up d3">
                  <div className="lab-mini">
                    <div className="ic">🩸</div>
                    <div>
                      <h4>Lab Companion</h4>
                      <p>Translate bloodwork into plain-language insight.</p>
                    </div>
                    <span className="soon">Soon</span>
                  </div>
                  <div className="lab-mini">
                    <div className="ic">🌙</div>
                    <div>
                      <h4>Cycle Coach</h4>
                      <p>Phase-by-phase food, movement & rest.</p>
                    </div>
                    <span className="soon">Soon</span>
                  </div>
                  <div className="lab-mini">
                    <div className="ic">📋</div>
                    <div>
                      <h4>Smart Grocery List</h4>
                      <p>Turn any protocol into a shopping list.</p>
                    </div>
                    <span className="soon">Soon</span>
                  </div>
                </div>
              </div>
              <div className="lab-card up d2">
                <div className="lab-head">
                  <span className="lab-badge">
                    <span className="dot"></span> Live · Powered by AI
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "1.05rem",
                      color: "var(--mint)",
                    }}
                  >
                    Wellness Assistant
                  </span>
                </div>
                <div className="lab-tools">
                  <button
                    className={`tool-chip ${chatMode === "assistant" ? "active" : ""}`}
                    onClick={() => setChatMode("assistant")}
                  >
                    🌿 Ask
                  </button>
                  <button
                    className={`tool-chip ${chatMode === "meal" ? "active" : ""}`}
                    onClick={() => setChatMode("meal")}
                  >
                    🍽️ Meals
                  </button>
                  <button
                    className={`tool-chip ${chatMode === "symptom" ? "active" : ""}`}
                    onClick={() => setChatMode("symptom")}
                  >
                    🔍 Symptoms
                  </button>
                </div>
                <div className="lab-inner">
                  <div className="chat">
                    {chatHistory.map((m, idx) => (
                      <div key={idx} className={`msg ${m.role} mt-2`}>
                        {m.role === "bot" && (
                          <strong className="mb-1 block">
                            Wellness Assistant
                          </strong>
                        )}
                        {m.text}
                      </div>
                    ))}
                  </div>
                  <div className="chat-input">
                    <input
                      type="text"
                      placeholder="Ask about nutrition, hormones, energy…"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    />
                    <button onClick={handleSendChat} aria-label="Send">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                  <p className="lab-note">
                    Education & inspiration only — not medical advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SCENE 7 · COMMUNITY ===== */}
        <section
          className={`scene ${activeScene === 7 ? "active" : ""}`}
          data-scene="7"
        >
          <div className="scene-index">
            <b>07</b>
            <span className="ln"></span> The Community
          </div>
          <div className="inner">
            <div className="ig">
              <div className="ig-header">
                <div>
                  <span className="eyebrow up">The Community</span>
                  <h2 className="neo-title up d1">
                    Daily wisdom on <em>Instagram</em>.
                  </h2>
                  <p className="lead up d2">
                    Bite-sized functional nutrition, hormone tips and real-woman
                    wins — shared with a community learning to trust their bodies
                    again.
                  </p>
                  <a
                    href="https://instagram.com/fitwithreshmi"
                    target="_blank"
                    rel="noreferrer"
                    className="ig-handle up d3"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" />
                    </svg>
                    @fitwithreshmi · Follow →
                  </a>
                </div>

                <div className="flex items-center gap-2 self-end mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (reelsScrollRef.current) {
                        reelsScrollRef.current.scrollBy({ left: -260, behavior: "smooth" });
                      }
                    }}
                    className="w-10 h-10 rounded-full border border-[var(--glass-line)] bg-[var(--glass)] hover:bg-[var(--jade)] hover:text-white text-[var(--ink)] flex items-center justify-center transition-colors shadow-sm"
                    aria-label="Scroll reels left"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (reelsScrollRef.current) {
                        reelsScrollRef.current.scrollBy({ left: 260, behavior: "smooth" });
                      }
                    }}
                    className="w-10 h-10 rounded-full border border-[var(--glass-line)] bg-[var(--glass)] hover:bg-[var(--jade)] hover:text-white text-[var(--ink)] flex items-center justify-center transition-colors shadow-sm"
                    aria-label="Scroll reels right"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Horizontal Scrollable Feed */}
              <div 
                ref={reelsScrollRef}
                className="ig-feed up d2"
              >
                {reels.map((reel, idx) => (
                  <a
                    key={reel.id || idx}
                    href={reel.instagramUrl || "https://instagram.com/fitwithreshmi"}
                    target="_blank"
                    rel="noreferrer"
                    className={`ig-tile ${idx % 2 === 0 ? "feat" : ""}`}
                    title={reel.title}
                  >
                    {reel.video_url ? (
                      <video 
                        src={reel.video_url} 
                        muted 
                        loop 
                        playsInline 
                        autoPlay 
                        className="object-cover w-full h-full"
                        poster={reel.thumbnail}
                      />
                    ) : (
                      <img src={reel.thumbnail} alt={reel.title} loading="lazy" />
                    )}
                    <div className="ig-overlay-grad"></div>
                    <div className="ig-info">
                      <h4>{reel.title}</h4>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#FFD2B8] mt-1">
                        <span className="flex items-center gap-1.5">
                          <Play size={11} fill="currentColor" /> {reel.duration || "0:50"}
                        </span>
                        {reel.views && (
                          <span className="opacity-90">{reel.views} views</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== SCENE 8 · CONTACT ===== */}
        <section
          className={`scene ${activeScene === 8 ? "active" : ""}`}
          data-scene="8"
        >
          <div className="scene-index">
            <b>08</b>
            <span className="ln"></span> Begin
          </div>
          <div className="inner contact">
            <span
              className="eyebrow up"
              style={{
                marginLeft: "auto",
                marginRight: "auto",
                display: "flex",
                width: "fit-content",
              }}
            >
              Begin
            </span>
            <h2 className="up d1">
              Ready to feel
              <br />
              <em>fully alive</em> again?
            </h2>
            <p className="lead up d2">
              Book a discovery consult and let's map the path back to your
              energy, balance and confidence.
            </p>
            <div className="contact-actions up d3">
              <button
                onClick={() => navigate("/booking")}
                className="neo-btn btn-primary"
              >
                Book a discovery call →
              </button>
              <button
                className="neo-btn btn-ghost"
                onClick={() => goToScene(6)}
              >
                ✦ Enter Full AI Lab
              </button>
            </div>
            <div className="foot up d4">
              Reshmi Verma · Functional Nutrition · Women's Wellness · ©{" "}
              {new Date().getFullYear()}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
