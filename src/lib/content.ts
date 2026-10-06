// Everything an admin can edit without touching code. The server stores one "content" document in the
// database; anything missing falls back to DEFAULT_CONTENT, and sanitizeContent() cleans whatever is saved.
import { DEFAULT_ASSESSMENT_CONFIG, type AssessmentConfig } from "./assessment";

export interface Service {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number; // 0 = free
}
export interface TimeWindow {
  start: string; // "HH:MM" 24h
  end: string;
}
export interface DaySchedule {
  enabled: boolean;
  windows: TimeWindow[];
}
export interface Availability {
  timezone: string;
  week: DaySchedule[]; // index 0 = Sunday
  slotMinutes: number; // length of each bookable slot
  gapMinutes: number; // rest between slots
  minNoticeHours: number;
  maxDaysAhead: number;
  blockedDates: string[]; // "YYYY-MM-DD" days off
}
export interface OnboardingQuestion {
  id: string;
  title: string;
  subtitle: string;
  options: string[];
}
export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}
export interface Photo {
  src: string;
  alt: string;
  label: string;
}

export interface SiteContent {
  banner: { enabled: boolean; text: string; linkLabel: string; linkUrl: string };
  hero: { eyebrow: string; headline: string; subheadline: string; primaryButton: string; secondaryButton: string; imageUrl: string };
  credibility: string[];
  about: { paragraphs: string[]; credentials: string[]; portraitUrl: string };
  transformation: { before: string; after: string; paragraphs: string[]; photos: Photo[] };
  clarity: { includes: string[] };
  contact: { email: string; phone: string; instagramHandle: string; pinnedPostUrl: string; assessmentFormUrl: string };
  reels: string[];
  testimonials: Testimonial[];
  services: Service[];
  currency: string;
  sections: { breathe: boolean; eva: boolean; instagram: boolean };
  onboarding: OnboardingQuestion[];
  availability: Availability;
}

const day = (enabled: boolean): DaySchedule => ({ enabled, windows: [{ start: "09:00", end: "17:00" }] });

export const DEFAULT_CONTENT: SiteContent = {
  banner: { enabled: false, text: "", linkLabel: "", linkUrl: "" },
  hero: {
    eyebrow: "Science-led. Human-centred.",
    headline: "More Energy.\nBetter Health.\nA Brighter You.",
    subheadline: "A personalised approach to nutrition, breathwork and lifestyle, designed around how you live, feel and function.",
    primaryButton: "Book a Health Clarity Session",
    secondaryButton: "Take Your Health Assessment",
    // PLACEHOLDER (Unsplash, free licence): replace with a warm photo of Reshmi from the admin
    imageUrl: "https://images.unsplash.com/photo-1729509804225-296f6ee80b67?auto=format&fit=crop&w=2400&q=80",
  },
  credibility: ["20+ Years in Healthcare Industry", "37+ kg Personal Transformation", "Personalised Health", "1:1 Guidance"],
  about: {
    paragraphs: [
      "I'm a Biotechnologist and MBA in Marketing & HR, with a specialisation in Medical Tourism, and I've spent over 20 years in the world of diagnostics and healthcare. I'm the Director of Rainbow Medinova Diagnostic Services and co-founder of Neofit Gym.",
      "As a Functional Nutritionist, Biohacker and Gut Health Coach, I've studied Functional Nutrition across India, the USA and Australia, and trained as an Oxygen Advantage Coach, Breath Resilience Instructor and Circular Connected Breathwork Facilitator.",
      "But perhaps my most personal qualification is my own transformation: losing more than 38 kg and completely changing my relationship with health.",
    ],
    credentials: [
      "Biotechnologist · MBA, Marketing & HR",
      "Director, Rainbow Medinova Diagnostic Services",
      "Co-founder, Neofit Gym",
      "Functional Nutritionist · Gut Health Coach · Biohacker",
      "Oxygen Advantage Coach",
      "Breath Resilience Instructor",
      "Circular Connected Breathwork Facilitator",
    ],
    portraitUrl: "/IMG_5514-scaled-e1762270577699.jpg",
  },
  transformation: {
    before: "98 kg",
    after: "60s kg",
    paragraphs: [
      "Losing more than 38 kg changed far more than my body. It changed my relationship with health, and it's the reason I do this work.",
      "I bring together science, healthcare experience and lived transformation to help people build better health, greater resilience and lasting change.",
    ],
    photos: [],
  },
  clarity: {
    includes: [
      "Walk through your health story, history and goals",
      "Look at your assessment results and any reports you already have",
      "Identify the patterns and priorities that matter most",
      "Agree the right health pathway for you",
    ],
  },
  contact: { email: "", phone: "", instagramHandle: "healthwithreshmi", pinnedPostUrl: "", assessmentFormUrl: "" },
  reels: [
    "https://www.instagram.com/healthwithreshmi/reel/Ddtm1wMTrRn/",
    "https://www.instagram.com/healthwithreshmi/reel/Dc64WfQz5m6/",
    "https://www.instagram.com/healthwithreshmi/reel/DdW0ClVTnB7/",
    "https://www.instagram.com/healthwithreshmi/reel/Ddn47KGzbkl/",
  ],
  testimonials: [],
  services: [
    {
      id: "clarity",
      title: "Health Clarity Session",
      description: "A focused 60-minute 1:1 session with Reshmi to explore your health story, assessment results and the right pathway for you.",
      durationMinutes: 60,
      price: 1999,
    },
  ],
  currency: "INR",
  sections: { breathe: true, eva: true, instagram: true },
  onboarding: [
    {
      id: "q1",
      title: "What health challenge are you currently facing?",
      subtitle: "Select the one that resonates most with you.",
      options: [
        "PMOS (PCOS) / Fertility issues",
        "Thyroid Issues / Hashimoto",
        "Stubborn Weight / Fat Loss Resistance",
        "Inflammation / Type 2 Diabetes",
        "Perimenopause / Menopause",
        "Gut Health",
        "Anxiety, Nervous System, Dysregulation",
      ],
    },
    {
      id: "q2",
      title: "How long have you been experiencing this?",
      subtitle: "There's no wrong answer — we just want to understand your journey.",
      options: ["Less than 6 months", "6 months – 1 year", "1 – 3 years", "3+ years"],
    },
    {
      id: "q3",
      title: "Have you tried any treatments or coaching before?",
      subtitle: "It's okay if you have — this will help Reshmi understand your history.",
      options: [
        "No, this would be my first time",
        "Yes, medications / pills from doctors",
        "Yes, diet plans or fitness programs",
        "Yes, multiple things but nothing worked",
      ],
    },
    {
      id: "q4",
      title: "What is your main goal right now?",
      subtitle: "What would success look like for you in 90 days?",
      options: [
        "Lose weight and feel confident",
        "Balance my hormones and regulate periods",
        "More energy and less fatigue",
        "Fix skin, hair, and gut issues",
        "Overall health transformation",
      ],
    },
    {
      id: "q5",
      title: "How ready are you to start your healing journey?",
      subtitle: "Be honest — there's no pressure. Just clarity.",
      options: ["I'm ready to start NOW 🔥", "I'm interested but want to learn more", "I'm exploring my options"],
    },
  ],
  availability: {
    timezone: "Asia/Kolkata",
    week: [day(true), day(true), day(true), day(true), day(true), day(true), day(true)],
    slotMinutes: 60,
    gapMinutes: 0,
    minNoticeHours: 12,
    maxDaysAhead: 60,
    blockedDates: [],
  },
};

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Instagram shortcode from a reel/post link, with or without the username segment. */
export function instagramCode(url: string): string | undefined {
  return url.match(/instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(?:reel|reels|p)\/([A-Za-z0-9_-]+)/)?.[1];
}

export function formatPrice(price: number, currency: string) {
  if (!price) return "Free";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}

// ---------------------------------------------------------------------------------------------
// Sanitising (used by the server on every save, and safe to use on anything read back)
// ---------------------------------------------------------------------------------------------
const str = (v: unknown, max = 300, fallback = ""): string => (typeof v === "string" ? v.trim().slice(0, max) : fallback);
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const list = <T,>(v: unknown, max: number, map: (x: any) => T | null): T[] =>
  (Array.isArray(v) ? v : []).slice(0, max).map(map).filter((x): x is T => x !== null);
const strings = (v: unknown, max: number, len = 400) => list(v, max, (x) => str(x, len) || null);
/** Only web links or site-relative paths: blocks javascript: and similar. */
const url = (v: unknown, fallback = "") => {
  const s = str(v, 600, fallback);
  return s === "" || /^https?:\/\//i.test(s) || /^\/[^/]/.test(s) ? s : fallback;
};
const hhmm = (v: unknown, fallback: string) => (typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : fallback);
const slug = (v: unknown, fallback: string) => str(v, 40).toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || fallback;
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const validTz = (tz: string) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export function sanitizeContent(input: any, base: SiteContent = DEFAULT_CONTENT): SiteContent {
  const i = input && typeof input === "object" ? input : {};
  const d = base;

  const banner = i.banner ?? {};
  const hero = i.hero ?? {};
  const about = i.about ?? {};
  const tr = i.transformation ?? {};
  const contact = i.contact ?? {};
  const sec = i.sections ?? {};
  const av = i.availability ?? {};

  const services = list(i.services, 12, (s): Service | null => {
    const title = str(s?.title, 100);
    return title
      ? { id: slug(s?.id, slug(title, "service")), title, description: str(s?.description, 400), durationMinutes: num(s?.durationMinutes, 5, 480, 60), price: num(s?.price, 0, 1_000_000, 0) }
      : null;
  });
  const seen = new Set<string>();
  for (const s of services) {
    while (seen.has(s.id)) s.id += "-2";
    seen.add(s.id);
  }

  const week: DaySchedule[] = Array.from({ length: 7 }, (_, n) => {
    const src = Array.isArray(av.week) ? av.week[n] : null;
    if (!src) return d.availability.week[n];
    const windows = list(src.windows, 4, (w): TimeWindow | null => {
      const start = hhmm(w?.start, "");
      const end = hhmm(w?.end, "");
      return start && end && start < end ? { start, end } : null;
    }).sort((a, b) => a.start.localeCompare(b.start));
    return { enabled: bool(src.enabled, false), windows };
  });

  const onboarding = list(i.onboarding, 12, (q): OnboardingQuestion | null => {
    const title = str(q?.title, 200);
    const options = strings(q?.options, 12, 160);
    return title && options.length >= 2 ? { id: "", title, subtitle: str(q?.subtitle, 240), options } : null;
  }).map((q, n) => ({ ...q, id: `q${n + 1}` }));

  const tz = str(av.timezone, 60, d.availability.timezone);

  return {
    banner: { enabled: bool(banner.enabled, d.banner.enabled), text: str(banner.text, 240), linkLabel: str(banner.linkLabel, 40), linkUrl: url(banner.linkUrl) },
    hero: {
      eyebrow: str(hero.eyebrow, 80, d.hero.eyebrow),
      headline: str(hero.headline, 160, d.hero.headline) || d.hero.headline,
      subheadline: str(hero.subheadline, 400, d.hero.subheadline),
      primaryButton: str(hero.primaryButton, 60) || d.hero.primaryButton,
      secondaryButton: str(hero.secondaryButton, 60) || d.hero.secondaryButton,
      imageUrl: url(hero.imageUrl, d.hero.imageUrl) || d.hero.imageUrl,
    },
    credibility: strings(i.credibility, 6, 80),
    about: {
      paragraphs: strings(about.paragraphs, 6, 1200),
      credentials: strings(about.credentials, 14, 120),
      portraitUrl: url(about.portraitUrl, d.about.portraitUrl),
    },
    transformation: {
      before: str(tr.before, 30, d.transformation.before),
      after: str(tr.after, 30, d.transformation.after),
      paragraphs: strings(tr.paragraphs, 5, 800),
      photos: list(tr.photos, 6, (p): Photo | null => {
        const src = url(p?.src);
        return src ? { src, alt: str(p?.alt, 120), label: str(p?.label, 40) } : null;
      }),
    },
    clarity: { includes: strings(i.clarity?.includes, 8, 200) },
    contact: {
      email: str(contact.email, 120),
      phone: str(contact.phone, 40),
      instagramHandle: str(contact.instagramHandle, 40).replace(/^@/, "").replace(/[^A-Za-z0-9_.]/g, ""),
      pinnedPostUrl: url(contact.pinnedPostUrl),
      assessmentFormUrl: url(contact.assessmentFormUrl),
    },
    reels: list(i.reels, 20, (r) => {
      const u = url(r);
      return u && instagramCode(u) ? u : null;
    }),
    testimonials: list(i.testimonials, 12, (t): Testimonial | null => {
      const quote = str(t?.quote, 600);
      const name = str(t?.name, 80);
      return quote && name ? { quote, name, detail: str(t?.detail, 120) } : null;
    }),
    services: services.length ? services : d.services,
    currency: str(i.currency, 3, d.currency).toUpperCase() || d.currency,
    sections: { breathe: bool(sec.breathe, true), eva: bool(sec.eva, true), instagram: bool(sec.instagram, true) },
    onboarding: onboarding.length ? onboarding : d.onboarding,
    availability: {
      timezone: validTz(tz) ? tz : d.availability.timezone,
      week,
      slotMinutes: num(av.slotMinutes, 10, 240, d.availability.slotMinutes),
      gapMinutes: num(av.gapMinutes, 0, 120, d.availability.gapMinutes),
      minNoticeHours: num(av.minNoticeHours, 0, 720, d.availability.minNoticeHours),
      maxDaysAhead: num(av.maxDaysAhead, 1, 365, d.availability.maxDaysAhead),
      blockedDates: list(av.blockedDates, 400, (x) => (typeof x === "string" && isDate(x) ? x : null)).sort(),
    },
  };
}

export function sanitizeAssessmentConfig(input: any): AssessmentConfig | null {
  const used = new Set<string>();
  const domains = list(input?.domains, 8, (d) => {
    const label = str(d?.label, 80);
    const questions = list(d?.questions, 12, (q) => {
      const question = str(q?.question, 300);
      const options = list(q?.options, 8, (o) => {
        const l = str(o?.label, 200);
        return l ? { label: l, points: num(o?.points, 0, 100, 0) } : null;
      });
      return question && options.length >= 2 ? { question, options } : null;
    });
    if (!label || questions.length === 0) return null;
    let key = slug(d?.key, slug(label, "area"));
    while (used.has(key)) key += "-2";
    used.add(key);
    return { key, label, title: str(d?.title, 120) || label, subtitle: str(d?.subtitle, 240), questions };
  });
  return domains.length ? { domains } : null;
}

export { DEFAULT_ASSESSMENT_CONFIG };
