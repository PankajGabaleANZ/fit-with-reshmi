import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, Dna, Leaf, Search, Sprout, Wind } from "lucide-react";
import Assessment from "../components/home/Assessment";
import BreatheNow from "../components/home/BreatheNow";
import Brand from "../components/Brand";
import Eva from "../components/home/Eva";
import InstagramReels from "../components/home/InstagramReels";
import Tags from "../components/home/Tags";
import { BODY, BTN_ON_DARK, BTN_OUTLINE, BTN_PRIMARY, CARD, CONTAINER, EYEBROW, H1, H2, H3, MONO, SECTION } from "../components/home/ui";
import { DEFAULT_CONTENT, instagramCode } from "../lib/content";
import { useAssessmentConfig, useContent } from "../lib/useContent";

// PLACEHOLDER (Unsplash, free licence): shown beside "How we work together" until a pinned post is set
const WORK_IMAGE = "https://images.unsplash.com/photo-1788927755531-08bd95fc0b74?auto=format&fit=crop&w=1200&q=80";

const WHOLE_STORY = [
  { icon: Search, title: "Health insights", desc: "Bring together your health story, history and available information to see the bigger picture." },
  { icon: Activity, title: "Gut health", desc: "Understand your digestion, gut patterns and the factors that may influence how you feel." },
  { icon: Wind, title: "Breathwork & regulation", desc: "Breathe, regulate and build greater resilience." },
  { icon: Leaf, title: "Personalised nutrition", desc: "Build an approach to food and nutrition that works for your body and your life." },
  { icon: Dna, title: "Hormonal health", desc: "Support your body through changing needs and different life stages." },
  { icon: Sprout, title: "Longevity & healthy ageing", desc: "Build the foundations for a healthier, stronger future." },
];

const SAMYA = [
  { letter: "S", title: "See the signs", desc: "Notice what your body is telling you: energy, digestion, sleep, mood and stress." },
  { letter: "A", title: "Ask the right questions", desc: "Look beyond symptoms into your history, habits and the context of your life." },
  { letter: "M", title: "Map the patterns", desc: "Connect the dots between signals that usually get treated as separate problems." },
  { letter: "Y", title: "Your customised solution", desc: "A plan built around your life, your goals and the way you actually live." },
  { letter: "A", title: "Achieve lasting wellness", desc: "Sustainable change that holds, with guidance for as long as you need it." },
];

const CLARITY_STEPS = [
  { n: "01", title: "Your assessment highlights the patterns", desc: "A 5-minute snapshot of how your gut, breath, hormones and sleep are doing." },
  { n: "02", title: "Your Clarity Session explores your story", desc: "A focused 60-minute 1:1 conversation with Reshmi." },
  { n: "03", title: "Your pathway takes shape", desc: "You leave with clear priorities and the right next step for you." },
];

/** "20+ Years in Healthcare" -> { metric: "20+", label: "Years in Healthcare" }; no number -> metric only */
function splitStat(text: string) {
  const m = text.match(/^(\S*\d\S*(?:\s?kg)?)\s+(.+)$/i);
  return m ? { metric: m[1], label: m[2] } : { metric: text, label: "" };
}

export default function Home() {
  const navigate = useNavigate();
  const c = useContent();
  const assessmentCfg = useAssessmentConfig();
  const [showAssessment, setShowAssessment] = useState(false);
  const [evaSeed, setEvaSeed] = useState<{ text: string; nonce: number } | null>(null);

  const startAssessment = () => {
    if (c.contact.assessmentFormUrl) window.open(c.contact.assessmentFormUrl, "_blank", "noopener");
    else setShowAssessment(true);
  };
  const book = () => navigate("/booking");
  const pinnedCode = c.contact.pinnedPostUrl ? instagramCode(c.contact.pinnedPostUrl) : undefined;
  const instagramHandle = c.contact.instagramHandle;
  const instagramUrl = `https://www.instagram.com/${instagramHandle}/`;
  const headlineLines = c.hero.headline.split("\n").filter(Boolean);
  const photos = c.transformation.photos;
  // The old light placeholder can't sit under a dark overlay: fall back to the new default photo
  const heroImage = !c.hero.imageUrl || c.hero.imageUrl.endsWith("hero-placeholder.svg") ? DEFAULT_CONTENT.hero.imageUrl : c.hero.imageUrl;

  return (
    <div className="bg-canvas text-ink min-h-screen selection:bg-terracotta selection:text-parchment">
      {/* 1 · HERO: full-bleed warm photo, dark overlay, parchment headline */}
      <section className="pt-[72px]">
        {c.banner.enabled && c.banner.text && (
          <div className="bg-terracotta text-parchment text-center text-[14px] px-4 py-2">
            <span>{c.banner.text}</span>
            {c.banner.linkUrl && c.banner.linkLabel && (
              <a href={c.banner.linkUrl} className="ml-2 underline underline-offset-2 text-parchment">
                {c.banner.linkLabel}
              </a>
            )}
          </div>
        )}
        <div className="relative min-h-[620px] lg:min-h-[calc(100vh-72px)] max-h-[900px] flex items-end overflow-hidden bg-ink">
          <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[rgba(32,24,20,0.58)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(32,24,20,0.55)] via-transparent to-transparent" />

          <div className={`relative w-full ${CONTAINER} px-5 sm:px-8 lg:px-10 pb-16 sm:pb-20 lg:pb-24 pt-24`}>
            <div className="max-w-[820px]">
              {c.hero.eyebrow && <p className="text-[12px] font-semibold uppercase tracking-[0.02em] text-parchment/90">{c.hero.eyebrow}</p>}
              <h1 className={`${H1} !text-parchment mt-5`}>
                {headlineLines.map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {i === headlineLines.length - 1 && headlineLines.length > 1 ? <em>{line}</em> : line}
                  </span>
                ))}
              </h1>
              {c.hero.subheadline && (
                <p className="text-[17px] sm:text-[20px] font-light leading-[1.45] text-parchment/80 max-w-[560px] mt-7">{c.hero.subheadline}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-10">
                <button onClick={book} className={BTN_PRIMARY}>
                  {c.hero.primaryButton} <ArrowRight size={16} />
                </button>
                <button onClick={startAssessment} className={BTN_ON_DARK}>
                  {c.hero.secondaryButton}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero stat blocks */}
        {c.credibility.length > 0 && (
          <div className={`${CONTAINER} px-5 sm:px-8 lg:px-10`}>
            <ul className="grid grid-cols-2 lg:grid-cols-4 border-b border-line">
              {c.credibility.map((t, i) => {
                const { metric, label } = splitStat(t);
                return (
                  <li
                    key={t}
                    className={`py-8 lg:py-10 px-4 sm:px-6 ${i % 2 === 1 ? "border-l" : ""} ${i > 0 ? "lg:border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} border-line`}
                  >
                    <p className="font-serif text-[30px] sm:text-[40px] leading-none text-ink">{metric}</p>
                    {label && <p className="text-[14px] text-faint mt-3">{label}</p>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* 2 · YOUR HEALTH. YOUR WHOLE STORY. */}
      <section id="whole-story" className={SECTION}>
        <div className={CONTAINER}>
          <div className="max-w-[760px]">
            <p className={EYEBROW}>Functional wellness</p>
            <h2 className={`${H2} mt-3`}>
              Your health. <em>Your whole story.</em>
            </h2>
            <p className={`${BODY} mt-6 max-w-[620px]`}>
              Energy, digestion, hormones, sleep, stress and longevity are not separate conversations. They're connected.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mt-14">
            {WHOLE_STORY.map(({ icon: Icon, title, desc }) => (
              <div key={title} className={CARD}>
                <Icon size={28} strokeWidth={1.5} className="text-accent" aria-hidden="true" />
                <h3 className="font-serif text-[26px] leading-[1.15] text-ink mt-10">{title}</h3>
                <p className="text-[16px] leading-[1.5] text-muted mt-3">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · THE SAMYA METHOD */}
      <section id="samya" className={`${SECTION} bg-surface`}>
        <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start`}>
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <p className={EYEBROW}>The SAMYA Method</p>
            <h2 className={`${H2} mt-3`}>
              A different way to <em>look at health</em>.
            </h2>
            <p className={`${BODY} mt-6 max-w-[460px]`}>
              Most health advice treats symptoms one at a time. SAMYA starts with you: your signs, your story and the patterns that connect them, so the plan you follow is yours.
            </p>
          </div>

          <ol className="lg:col-span-7 divide-y divide-line border-y border-line">
            {SAMYA.map((s, i) => (
              <li key={i} className="flex items-start gap-6 sm:gap-8 py-7">
                <span className="font-serif italic font-light text-[48px] leading-[0.9] text-ink w-10 shrink-0">{s.letter}</span>
                <div>
                  <h3 className="font-serif text-[24px] leading-[1.2] text-ink">{s.title}</h3>
                  <p className="text-[16px] leading-[1.5] text-muted mt-2">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Breathing pacer */}
      {c.sections.breathe && <BreatheNow />}

      {/* 4 · MEET RESHMI */}
      <section id="about" className={`${SECTION} bg-surface`}>
        <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center`}>
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] max-w-[480px] mx-auto lg:mx-0 rounded-[24px] overflow-hidden bg-card">
              <img src={c.about.portraitUrl} alt="Reshmi Verma" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className={EYEBROW}>Meet Reshmi</p>
            <h2 className={`${H2} mt-3`}>
              Science, healthcare experience and <em>lived transformation</em>.
            </h2>
            <div className={`${BODY} space-y-4 mt-7`}>
              {c.about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {c.about.credentials.length > 0 && <Tags items={c.about.credentials} className="mt-8" />}
            <a href="#transformation" className={`${BTN_OUTLINE} mt-10`}>
              Read my story <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* 5 · HEALTH RESILIENCE ASSESSMENT */}
      <section id="assessment" className={SECTION}>
        <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center`}>
          <div className="lg:col-span-6">
            <p className={EYEBROW}>Health Resilience Assessment</p>
            <h2 className={`${H2} mt-3`}>
              What is your health <em>really telling you</em>?
            </h2>
            <p className={`${BODY} mt-6 max-w-[500px]`}>
              A 5-minute assessment that turns how you feel day to day into a personalised health profile, showing where to look first.
            </p>
            <button onClick={startAssessment} className={`${BTN_PRIMARY} mt-10`}>
              Take the free assessment <ArrowRight size={16} />
            </button>
          </div>

          <div className="lg:col-span-6 bg-surface rounded-[24px] p-8 sm:p-10">
            <p className={MONO}>Free · about 5 minutes · not a diagnosis</p>
            <ul className="mt-6 divide-y divide-line">
              {assessmentCfg.domains.map((d, i) => (
                <li key={d.key} className="py-5 flex items-baseline gap-5">
                  <span className="text-[14px] font-semibold text-accent w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-serif text-[24px] leading-[1.2] text-ink">{d.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 6 · FROM INSIGHT TO CLARITY: numbered step cards */}
      <section id="clarity" className={`${SECTION} bg-surface`}>
        <div className={CONTAINER}>
          <div className="max-w-[760px]">
            <p className={EYEBROW}>The Health Clarity Session</p>
            <h2 className={`${H2} mt-3`}>
              From insight <em>to clarity</em>.
            </h2>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mt-14">
            {CLARITY_STEPS.map((s) => (
              <li key={s.n} className="bg-card rounded-[24px] px-8 py-10">
                <span className="text-[14px] font-semibold text-accent">{s.n}</span>
                <h3 className={`${H3} mt-8`}>{s.title}</h3>
                <p className="text-[16px] leading-[1.5] text-muted mt-4">{s.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h3 className={H3}>
                What happens in the <em>60 minutes</em>
              </h3>
              <Tags items={c.clarity.includes} className="mt-6 !text-[16px]" />
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <button onClick={book} className={BTN_PRIMARY}>
                Book a Health Clarity Session <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7 · HOW WE WORK TOGETHER */}
      <section id="how-we-work" className={SECTION}>
        <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center`}>
          <div className="lg:col-span-7">
            <p className={EYEBROW}>How we work together</p>
            <h2 className={`${H2} mt-3`}>
              There is no one-size-fits-all <em>program</em>.
            </h2>
            <p className={`${BODY} mt-6 max-w-[560px]`}>
              Your plan is built around your health story, goals and assessment. After your Clarity Session, the right health pathway is chosen for what you actually need.
            </p>
            <ol className="flex flex-wrap items-center gap-2 mt-10 text-[15px] text-ink">
              {["Clarity Session", "Recommended pathway", "Personalised program"].map((t, i, arr) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="px-5 py-2.5 rounded-full bg-surface border border-line">{t}</span>
                  {i < arr.length - 1 && <ArrowRight size={16} className="text-accent" aria-hidden="true" />}
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {pinnedCode ? (
              <div className="w-[min(92vw,360px)] h-[640px] rounded-[24px] overflow-hidden bg-surface border border-line">
                <iframe
                  src={`https://www.instagram.com/p/${pinnedCode}/embed/`}
                  title="Pinned Instagram post from HealthwithReshmi"
                  loading="lazy"
                  scrolling="no"
                  className="w-full h-full border-0 bg-transparent"
                />
              </div>
            ) : (
              <div className="w-full max-w-[460px] aspect-[4/5] rounded-[24px] overflow-hidden bg-surface">
                <img src={WORK_IMAGE} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8 · MY TRANSFORMATION */}
      <section id="transformation" className={`${SECTION} bg-surface`}>
        <div className={`${CONTAINER} grid grid-cols-1 ${photos.length ? "lg:grid-cols-12" : ""} gap-12 lg:gap-16 items-center`}>
          <div className={photos.length ? "lg:col-span-7" : "max-w-[860px]"}>
            <p className={EYEBROW}>My transformation</p>
            <p className="font-serif text-[56px] sm:text-[88px] leading-[0.9] text-ink mt-6">
              {c.transformation.before} <em className="font-light">to</em> {c.transformation.after}
            </p>
            {c.transformation.paragraphs.map((p, i) => (
              <p key={i} className={`${BODY} ${i === 0 ? "mt-9" : "mt-4"} max-w-[640px]`}>
                {p}
              </p>
            ))}
            <button onClick={book} className={`${BTN_OUTLINE} mt-10`}>
              Start your own story <ArrowRight size={16} />
            </button>
          </div>

          {photos.length > 0 && (
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {photos.map((p) => (
                <figure key={p.src} className="rounded-[24px] overflow-hidden bg-card">
                  <img src={p.src} alt={p.alt} className="w-full aspect-[3/4] object-cover" loading="lazy" />
                  <figcaption className={`${MONO} px-3 py-3 text-center`}>{p.label}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 9 · TESTIMONIALS (hidden until real ones are added in the admin) */}
      {c.testimonials.length > 0 && (
        <section id="testimonials" className={SECTION}>
          <div className={CONTAINER}>
            <p className={EYEBROW}>Testimonials</p>
            <h2 className={`${H2} mt-3`}>
              Real client <em>experiences</em>.
            </h2>
            <div className="mt-14 space-y-12 max-w-[760px]">
              {c.testimonials.map((t) => (
                <figure key={t.name} className="flex gap-5 sm:gap-6 items-start">
                  <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface border border-line flex items-center justify-center font-serif text-[22px] text-ink shrink-0" aria-hidden="true">
                    {t.name.trim().charAt(0)}
                  </span>
                  <div>
                    <blockquote className="font-serif italic font-light text-[22px] sm:text-[24px] leading-[1.35] text-ink">“{t.quote}”</blockquote>
                    <figcaption className="mt-4 text-[14px]">
                      <span className="font-semibold text-ink">{t.name}</span>
                      {t.detail && <span className="text-faint"> · {t.detail}</span>}
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10 · MEET EVA */}
      {c.sections.eva && <Eva seed={evaSeed} />}

      {/* 11 · INSTAGRAM */}
      {c.sections.instagram && <InstagramReels />}

      {/* 12 · FINAL CTA + FOOTER */}
      <footer id="contact" className={SECTION}>
        <div className={`${CONTAINER} text-center`}>
          <h2 className={`${H2} max-w-[820px] mx-auto`}>
            Your health deserves <em>clarity</em>.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <button onClick={book} className={BTN_PRIMARY}>
              Book a Health Clarity Session <ArrowRight size={16} />
            </button>
            <button onClick={startAssessment} className={BTN_OUTLINE}>
              Take the free assessment
            </button>
          </div>
        </div>

        <div className={`${CONTAINER} mt-[80px] pt-8 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4 text-[14px] text-faint text-center md:text-left`}>
          <span>
            © {new Date().getFullYear()} <Brand tm={false} className="font-serif text-[16px] text-ink" />. Educational content only, not a substitute for medical advice.
          </span>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer">
            {c.contact.email && (
              <a href={`mailto:${c.contact.email}`} className="hover:text-ink transition-colors no-underline">
                {c.contact.email}
              </a>
            )}
            {c.contact.phone && (
              <a href={`tel:${c.contact.phone.replace(/[^+\d]/g, "")}`} className="hover:text-ink transition-colors no-underline">
                {c.contact.phone}
              </a>
            )}
            {instagramHandle && (
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="hover:text-ink transition-colors no-underline">
                Instagram @{instagramHandle}
              </a>
            )}
            <a href="/login" className="hover:text-ink transition-colors no-underline">
              Client portal
            </a>
          </nav>
        </div>
      </footer>

      {showAssessment && (
        <Assessment
          onClose={() => setShowAssessment(false)}
          onBook={() => {
            setShowAssessment(false);
            book();
          }}
          onAskEva={(text) => {
            setShowAssessment(false);
            setEvaSeed({ text, nonce: Date.now() });
          }}
        />
      )}
    </div>
  );
}
