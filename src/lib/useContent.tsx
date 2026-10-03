import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_CONTENT, type SiteContent } from "./content";
import { DEFAULT_ASSESSMENT_CONFIG, type AssessmentConfig } from "./assessment";

const CACHE_KEY = "hwr_content_v1";
const ContentContext = createContext<SiteContent>(DEFAULT_CONTENT);

function readCache(): SiteContent | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? ({ ...DEFAULT_CONTENT, ...JSON.parse(raw) } as SiteContent) : null;
  } catch {
    return null;
  }
}

/** Loads the admin-edited website content once. Returning visitors see the last copy instantly. */
export function ContentProvider({ children }: { children: ReactNode }) {
  const cached = readCache();
  const [content, setContent] = useState<SiteContent>(cached ?? DEFAULT_CONTENT);
  const [ready, setReady] = useState(Boolean(cached));

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => alive && setReady(true), 2500); // never block the page on a slow server
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!alive || !d?.content) return;
        setContent(d.content);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(d.content));
        } catch {
          /* private mode: fine */
        }
      })
      .catch(() => {})
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  if (!ready) return <div className="min-h-screen bg-canvas" />;
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);

let assessmentPromise: Promise<AssessmentConfig> | null = null;
/** The questionnaire (admin-editable). Starts with the built-in default, then swaps in the saved one. */
export function useAssessmentConfig(): AssessmentConfig {
  const [cfg, setCfg] = useState<AssessmentConfig>(DEFAULT_ASSESSMENT_CONFIG);
  useEffect(() => {
    let alive = true;
    assessmentPromise ??= fetch("/api/assessment/config")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => d.config as AssessmentConfig)
      .catch(() => {
        assessmentPromise = null;
        return DEFAULT_ASSESSMENT_CONFIG;
      });
    assessmentPromise.then((c) => alive && setCfg(c));
    return () => {
      alive = false;
    };
  }, []);
  return cfg;
}
