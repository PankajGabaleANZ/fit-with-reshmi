import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Send } from "lucide-react";
import Brand from "../Brand";
import { BODY, BTN_DARK, CONTAINER, EYEBROW, H2, SECTION } from "./ui";

interface Msg {
  role: "user" | "eva";
  text: string;
}

const GREETING: Msg = {
  role: "eva",
  text:
    "Hi, I'm Eva, the HealthwithReshmi™ assistant. Ask me about nutrition, gut health, breathwork, sleep or longevity, how the assessment works, or what happens in a Health Clarity Session. I share general education, not medical advice.",
};

const SUGGESTIONS = [
  "What is a Health Clarity Session?",
  "How does the assessment work?",
  "What does it cost?",
  "Where should I start with gut health?",
];

const CAPABILITIES = [
  "General health questions",
  "Assessment help",
  "Understanding your results",
  "FAQs",
  "The Clarity Session",
  "Booking",
];

/** "Meet Eva": the HealthwithReshmi AI assistant (server-side Gemini via /api/eva/chat). */
export default function Eva({ seed }: { seed: { text: string; nonce: number } | null }) {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const busyRef = useRef(false);

  // Keep the newest message in view without scrolling the page
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (raw: string) => {
    const text = raw.trim().slice(0, 600);
    if (!text || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setInput("");
    const next: Msg[] = [...messagesRef.current, { role: "user", text }];
    setMessages(next);
    try {
      const res = await fetch("/api/eva/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1).map((m) => ({ role: m.role, text: m.text })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.text) throw new Error(data.error || "Eva is unavailable");
      setMessages((m) => [...m, { role: "eva", text: data.text }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "eva",
          text: "Sorry, I can't answer right now. You can still book a Health Clarity Session with Reshmi and she'll take it from there.",
        },
      ]);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  // A question handed over from elsewhere on the page (e.g. assessment results)
  useEffect(() => {
    if (seed?.text) {
      document.getElementById("eva")?.scrollIntoView({ behavior: "smooth", block: "start" });
      void send(seed.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed?.nonce]);

  return (
    <section id="eva" className={SECTION}>
      <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center`}>
        <div className="lg:col-span-5">
          <p className={EYEBROW}>Meet Eva</p>
          <h2 className={`${H2} mt-4`}>
            Your <Brand /> <em>AI assistant</em>.
          </h2>
          <p className={`${BODY} mt-6`}>
            Eva helps you learn, find your way around and take the next step, any time of day.
          </p>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[14px] text-muted">
            {CAPABILITIES.map((c) => (
              <li key={c} className="flex gap-3 items-start">
                <Check size={16} className="text-agave mt-0.5 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => inputRef.current?.focus()} className={`${BTN_DARK} mt-9`}>
            Ask Eva <ArrowRight size={14} />
          </button>
        </div>

        <div className="lg:col-span-7 bg-card border border-line rounded-xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-line mb-4">
            <span className="text-[12px] font-semibold tracking-[0.14em] uppercase text-ink">Eva · AI assistant</span>
            <Link
              to="/booking"
              className="text-[12px] font-semibold tracking-[0.1em] uppercase text-accent hover:text-ink transition-colors no-underline"
            >
              Book a session →
            </Link>
          </div>

          <div ref={scroller} className="h-72 overflow-y-auto space-y-3 pr-2 mb-4" aria-live="polite">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl text-[13px] sm:text-sm leading-relaxed max-w-[88%] whitespace-pre-line ${
                  m.role === "eva" ? "bg-surface text-ink mr-auto" : "bg-terracotta text-white ml-auto"
                }`}
              >
                {m.text}
              </div>
            ))}
            {busy && (
              <div className="p-3.5 rounded-xl text-sm bg-surface text-faint mr-auto w-fit" aria-label="Eva is typing">
                Eva is typing…
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-3 py-1.5 rounded-md bg-surface text-[12px] text-muted hover:text-ink border border-line transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={600}
              placeholder="Ask Eva anything about your health journey…"
              aria-label="Message Eva"
              className="flex-1 min-w-0 px-4 py-3 rounded-md bg-canvas border border-line text-[13px] text-ink placeholder:text-faint focus:outline-none focus:border-terracotta"
            />
            <button
              type="submit"
              disabled={busy}
              aria-label="Send message"
              className="px-5 rounded-md bg-ink text-canvas hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
          <p className="text-[11px] text-faint mt-3">
            Eva shares general education only. She can't diagnose, prescribe or replace a doctor or a consultation with Reshmi.
          </p>
        </div>
      </div>
    </section>
  );
}
