// Question bank for the Health Resilience Assessment (4 domains x 4 questions, 25 points each).
// Educational screening only, not a diagnosis.

export interface AuditQuestion {
  question: string;
  options: { label: string; points: number }[];
}

export const AUDIT_QUESTIONS: Record<string, { title: string; subtitle: string; questions: AuditQuestion[] }> = {
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

export const DOMAIN_ORDER = ["gut", "bolt", "hormone", "sleep"] as const;
export type DomainKey = (typeof DOMAIN_ORDER)[number];

export const DOMAIN_LABELS: Record<DomainKey, string> = {
  gut: "Gut & Metabolic Health",
  bolt: "Breath & Regulation",
  hormone: "Hormonal & Lifestyle Balance",
  sleep: "Sleep & Recovery",
};

// One flat list of all questions in order, tagged with their domain.
export const ALL_QUESTIONS = DOMAIN_ORDER.flatMap((domain) =>
  AUDIT_QUESTIONS[domain].questions.map((q) => ({ ...q, domain }))
);
// ---- Editable questionnaire (stored in the database; the data above is the starting default) ----
export interface AssessmentConfig {
  domains: {
    key: string;
    label: string;
    title: string;
    subtitle: string;
    questions: AuditQuestion[];
  }[];
}

export const DEFAULT_ASSESSMENT_CONFIG: AssessmentConfig = {
  domains: DOMAIN_ORDER.map((key) => ({
    key,
    label: DOMAIN_LABELS[key],
    title: AUDIT_QUESTIONS[key].title,
    subtitle: AUDIT_QUESTIONS[key].subtitle,
    questions: AUDIT_QUESTIONS[key].questions,
  })),
};

/** Flat question list in order, tagged with the domain key. */
export function flattenQuestions(cfg: AssessmentConfig) {
  return cfg.domains.flatMap((d) => d.questions.map((q) => ({ ...q, domain: d.key })));
}

/** Score each domain out of 100 from the chosen option points (works for any number of questions). */
export function scoreAssessment(cfg: AssessmentConfig, answers: number[]) {
  let i = 0;
  const domains: Record<string, number> = {};
  for (const d of cfg.domains) {
    let got = 0;
    let max = 0;
    for (const q of d.questions) {
      got += answers[i++] ?? 0;
      max += Math.max(0, ...q.options.map((o) => o.points));
    }
    domains[d.key] = max > 0 ? Math.round((got / max) * 100) : 0;
  }
  const keys = Object.keys(domains);
  const overall = keys.length ? Math.round(keys.reduce((s, k) => s + domains[k], 0) / keys.length) : 0;
  return { overall, domains };
}
