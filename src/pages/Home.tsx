import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, Dna, Leaf, Search, Sprout, Wind } from "lucide-react";
import Assessment from "../components/home/Assessment";
import BreatheNow from "../components/home/BreatheNow";
import Brand from "../components/Brand";
import Eva from "../components/home/Eva";
import InstagramReels from "../components/home/InstagramReels";
import { BODY, BTN_DARK, BTN_OUTLINE, BTN_PRIMARY, CONTAINER, EYEBROW, H2, SECTION } from "../components/home/ui";
import { instagramCode } from "../lib/content";
import { useAssessmentConfig, useContent } from "../lib/useContent";

const WHOLE_STORY = [
  { icon: Search, title: "Health Insights", desc: "Bring together your health story, history and available information to see the bigger picture." },
  { icon: Activity, title: "Gut Health", desc: "Understand your digestion, gut patterns and the factors that may influence how you feel." },
  { icon: Wind, title: "Breathwork & Regulation", desc: "Breathe, regulate and build greater resilience." },
  { icon: Leaf, title: "Personalised Nutrition", desc: "Build an approach to food and nutrition that works for your body and your life." },
  { icon: Dna, title: "Hormonal Health", desc: "Support your body through changing needs and different life stages." },
  { icon: Sprout, title: "Longevity & Healthy Ageing", desc: "Build the foundations for a healthier, stronger future." },
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
  { n: "02", title: "Your Health Clarity Session explores your story", desc: "A focused 60-minute 1:1 conversation with Reshmi." },
  { n: "03", title: "Your pathway takes shape", desc: "You leave with clear priorities and the right next step for you." },
];

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

  return (
    <div className="bg-canvas text-ink min-h-screen selection:bg-terracotta selection:text-white">
      {/* 1 · HERO */}
      <section className="pt-[72px]">
        {c.banner.enabled && c.banner.text && (
          <div className="bg-ink text-canvas text-center text-[13px] px-4 py-2.5">
            <span>{c.banner.text}</span>
            {c.banner.linkUrl && c.banner.linkLabel && (
              <a href={c.banner.linkUrl} className="ml-3 underline underline-offset-2 text-canvas">
                {c.banner.linkLabel}
              </a>
            )}
          </div>
        )}
        <div className={`${CONTAINER} px-5 sm:px-8 pt-5 sm:pt-6`}>
          <div className="relative rounded-2xl overflow-hidden min-h-[560px] lg:min-h-[640px] flex items-center bg-surface">
            <img src={c.hero.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover object-right" />
            <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/85 to-canvas/10 lg:via-canvas/55 lg:to-transparent" />

            <div className="relative px-6 sm:px-12 lg:px-16 py-14 max-w-[760px]">
              {c.hero.eyebrow && <p className={EYEBROW}>{c.hero.eyebrow}</p>}
              <h1 className="font-serif font-light text-[40px] sm:text-[56px] lg:text-[66px] leading-[1.05] tracking-tight text-ink mt-5">
                {headlineLines.map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {i === headlineLines.length - 1 && headlineLines.length > 1 ? <em>{line}</em> : line}
                  </span>
                ))}
              </h1>
              {c.hero.subheadline && <p className={`${BODY} max-w-[500px] mt-6`}>{c.hero.subheadline}</p>}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-9">
                <button onClick={book} className={BTN_PRIMARY}>
                  {c.hero.primaryButton} <ArrowRight size={14} />
                </button>
                <button onClick={startAssessment} className={BTN_OUTLINE}>
                  {c.hero.secondaryButton} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Credibility strip */}
          {c.credibility.length > 0 && (
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6 mt-8 sm:mt-10 text-center">
              {c.credibility.map((t) => (
                <li key={t} className="text-[12px] sm:text-[13px] tracking-[0.12em] uppercase text-muted lg:border-l first:border-l-0 border-line px-2">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 2 · YOUR HEALTH. YOUR WHOLE STORY. */}
      <section id="whole-story" className={SECTION}>
        <div className={CONTAINER}>
          <div className="text-center max-w-[720px] mx-auto">
            <h2 className={H2}>
              Your health. <em>Your whole story.</em>
            </h2>
            <p className={`${BODY} mt-6`}>
              Because energy, digestion, hormones, sleep, stress and longevity are not separate conversations. They're connected.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mt-12">
            {WHOLE_STORY.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-surface border border-line rounded-xl p-8">
                <Icon size={28} strokeWidth={1.25} className="text-ink" aria-hidden="true" />
                <h3 className="font-serif font-normal text-[22px] text-ink mt-7">{title}</h3>
                <p className="text-[14px] leading-relaxed text-muted mt-3">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · A DIFFERENT WAY TO LOOK AT HEALTH · SAMYA */}
      <section id="samya" className={`${SECTION} bg-surface`}>
        <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start`}>
          <div className="lg:col-span-5">
            <p className={EYEBROW}>The SAMYA Method</p>
            <h2 className={`${H2} mt-4`}>
              A different way to <em>look at health</em>.
            </h2>
            <p className={`${BODY} mt-6 max-w-[460px]`}>
              Most health advice treats symptoms one at a time. SAMYA starts with you: your signs, your story and the patterns that connect them, so the plan you follow is yours.
            </p>
          </div>

          <ol className="lg:col-span-7 divide-y divide-line border-y border-line">
            {SAMYA.map((s, i) => (
              <li key={i} className="flex items-start gap-6 py-6">
                <span className="font-serif font-light text-[44px] leading-none text-accent w-11 shrink-0">{s.letter}</span>
                <div>
                  <h3 className="font-serif font-normal text-[20px] text-ink">{s.title}</h3>
                  <p className="text-[14px] sm:text-[15px] leading-relaxed text-muted mt-1.5">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {c.sections.breathe && <BreatheNow />}

      {/* 4 · MEET RESHMI */}
      <section id="about" className={SECTION}>
        <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center`}>
          <div className="lg:col-span-5">
            <div className="aspect-square max-w-[460px] mx-auto lg:mx-0 rounded-2xl overflow-hidden bg-surface border border-line">
              <img src={c.about.portraitUrl} alt="Reshmi Verma" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className={EYEBROW}>Meet Reshmi</p>
            <h2 className={`${H2} mt-4`}>
              Science, healthcare experience and <em>lived transformation</em>.
            </h2>
            <div className={`${BODY} space-y-4 mt-6`}>
              {c.about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <ul className="flex flex-wrap gap-2 mt-7">
              {c.about.credentials.map((t) => (
                <li key={t} className="px-3 py-1.5 rounded-md bg-surface border border-line text-[12px] text-muted">
                  {t}
                </li>
              ))}
            </ul>
            <a href="#transformation" className={`${BTN_DARK} mt-9`}>
              Read my story <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* 5 · HEALTH RESILIENCE ASSESSMENT */}
      <section id="assessment" className={`${SECTION} bg-surface`}>
        <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center`}>
          <div className="lg:col-span-6">
            <p className={EYEBROW}>Health Resilience Assessment</p>
            <h2 className={`${H2} mt-4`}>
              What is your health <em>really telling you</em>?
            </h2>
            <p className={`${BODY} mt-6 max-w-[500px]`}>
              A 5-minute assessment that turns how you feel day to day into a personalised health profile, showing where to look first.
            </p>
            <button onClick={startAssessment} className={`${BTN_PRIMARY} mt-9`}>
              Take the Free Assessment <ArrowRight size={14} />
            </button>
          </div>

          <div className="lg:col-span-6 bg-card border border-line rounded-xl p-8 sm:p-10">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-faint">What it looks at</p>
            <ul className="mt-5 divide-y divide-line">
              {assessmentCfg.domains.map((d) => (
                <li key={d.key} className="py-4 font-serif text-[20px] text-ink">
                  {d.label}
                </li>
              ))}
            </ul>
            <p className="text-[12px] text-faint mt-5">Free · about 5 minutes · an educational snapshot, not a diagnosis</p>
          </div>
        </div>
      </section>

      {/* 6 · FROM INSIGHT TO CLARITY */}
      <section id="clarity" className={SECTION}>
        <div className={CONTAINER}>
          <div className="text-center max-w-[720px] mx-auto">
            <p className={EYEBROW}>The Health Clarity Session</p>
            <h2 className={`${H2} mt-4`}>
              From insight <em>to clarity</em>.
            </h2>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mt-12">
            {CLARITY_STEPS.map((s) => (
              <li key={s.n} className="bg-surface border border-line rounded-xl p-8">
                <span className="font-serif font-light text-[40px] leading-none text-accent">{s.n}</span>
                <h3 className="font-serif font-normal text-[22px] leading-snug text-ink mt-6">{s.title}</h3>
                <p className="text-[14px] leading-relaxed text-muted mt-3">{s.desc}</p>
              </li>
            ))}
          </ol>

          <div className="max-w-[720px] mx-auto mt-14 text-center">
            <h3 className="font-serif font-light text-[26px] text-ink">What happens in the 60 minutes</h3>
            <ul className="mt-6 space-y-3 text-left inline-block text-[15px] text-muted">
              {c.clarity.includes.map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="text-accent mt-0.5">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <button onClick={book} className={BTN_PRIMARY}>
                Book a Health Clarity Session <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7 · HOW WE WORK TOGETHER */}
      <section id="how-we-work" className={`${SECTION} bg-surface`}>
        <div className={`${CONTAINER} grid grid-cols-1 ${pinnedCode ? "lg:grid-cols-12" : ""} gap-12 lg:gap-16 items-center`}>
          <div className={pinnedCode ? "lg:col-span-7" : "max-w-[820px] mx-auto text-center"}>
            <p className={EYEBROW}>How we work together</p>
            <h2 className={`${H2} mt-4`}>
              There is no one-size-fits-all <em>program</em>.
            </h2>
            <p className={`${BODY} mt-6`}>
              Your plan is built around your health story, goals and assessment. After your Clarity Session, the right health pathway is chosen for what you actually need.
            </p>
            <ol className={`flex flex-wrap items-center gap-3 mt-9 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink ${pinnedCode ? "" : "justify-center"}`}>
              {["Clarity Session", "Recommended pathway", "Personalised program"].map((t, i, arr) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="px-4 py-2.5 rounded-md bg-card border border-line">{t}</span>
                  {i < arr.length - 1 && <ArrowRight size={14} className="text-accent" aria-hidden="true" />}
                </li>
              ))}
            </ol>
          </div>

          {pinnedCode && (
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-[min(92vw,360px)] h-[640px] rounded-xl overflow-hidden bg-card border border-line">
                <iframe
                  src={`https://www.instagram.com/p/${pinnedCode}/embed/`}
                  title="Pinned Instagram post from HealthwithReshmi"
                  loading="lazy"
                  scrolling="no"
                  className="w-full h-full border-0 bg-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 8 · MY TRANSFORMATION */}
      <section id="transformation" className={SECTION}>
        <div className={`${CONTAINER} grid grid-cols-1 ${photos.length ? "lg:grid-cols-12" : ""} gap-12 lg:gap-16 items-center`}>
          <div className={photos.length ? "lg:col-span-7" : "max-w-[820px] mx-auto text-center"}>
            <p className={EYEBROW}>My transformation</p>
            <p className="font-serif font-light text-[48px] sm:text-[72px] leading-none tracking-tight text-ink mt-6">
              {c.transformation.before} <span className="text-accent">→</span> {c.transformation.after}
            </p>
            {c.transformation.paragraphs.map((p, i) => (
              <p key={i} className={`${BODY} ${i === 0 ? "mt-8" : "mt-4"}`}>
                {p}
              </p>
            ))}
            <button onClick={book} className={`${BTN_OUTLINE} mt-9`}>
              Start your own story <ArrowRight size={14} />
            </button>
          </div>

          {photos.length > 0 && (
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {photos.map((p) => (
                <figure key={p.src} className="rounded-xl overflow-hidden border border-line bg-surface">
                  <img src={p.src} alt={p.alt} className="w-full aspect-[3/4] object-cover" loading="lazy" />
                  <figcaption className="px-3 py-2 text-[11px] tracking-[0.14em] uppercase text-faint text-center">{p.label}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 9 · TESTIMONIALS (hidden until real ones are added in the admin) */}
      {c.testimonials.length > 0 && (
        <section id="testimonials" className={`${SECTION} bg-surface`}>
          <div className={CONTAINER}>
            <div className="text-center">
              <p className={EYEBROW}>Testimonials</p>
              <h2 className={`${H2} mt-4`}>
                Real client <em>experiences</em>.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mt-12">
              {c.testimonials.map((t) => (
                <figure key={t.name} className="bg-card border border-line rounded-xl p-8">
                  <blockquote className="font-serif text-[19px] leading-relaxed text-ink">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 text-[13px] text-muted">
                    <span className="font-semibold text-ink">{t.name}</span>
                    {t.detail && <span> · {t.detail}</span>}
                  </figcaption>
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
        <div className="max-w-[820px] mx-auto text-center">
          <h2 className={H2}>
            Your health deserves <em>clarity</em>.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-9">
            <button onClick={book} className={BTN_PRIMARY}>
              Book a Health Clarity Session <ArrowRight size={14} />
            </button>
            <button onClick={startAssessment} className={BTN_OUTLINE}>
              Take the Free Assessment
            </button>
          </div>
        </div>

        <div className={`${CONTAINER} mt-[72px] pt-8 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-faint text-center md:text-left`}>
          <span>© {new Date().getFullYear()} <Brand tm={false} className="font-serif text-[14px] text-muted" />. Educational content only, not a substitute for medical advice.</span>
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
            <a href="/login" className="hover:text-ink transition-colors no-underline">Client portal</a>
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
