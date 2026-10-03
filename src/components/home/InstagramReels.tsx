import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { instagramCode } from "../../lib/content";
import { useContent } from "../../lib/useContent";
import { BODY, BTN_DARK, CONTAINER, EYEBROW, H2, SECTION } from "./ui";

/** Lightweight Instagram reel embeds: each iframe loads only when it scrolls near the viewport. */
export default function InstagramReels() {
  const scroller = useRef<HTMLDivElement>(null);
  const { reels, contact } = useContent();
  const codes = reels.map(instagramCode).filter((c): c is string => Boolean(c));
  const instagramUrl = `https://www.instagram.com/${contact.instagramHandle}/`;
  if (codes.length === 0) return null;

  return (
    <section id="instagram" className={`${SECTION} bg-surface`}>
      <div className={CONTAINER}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <p className={EYEBROW}>Instagram</p>
            <h2 className={`${H2} mt-4`}>
              Latest from <em>Reshmi's feed</em>.
            </h2>
            <p className={`${BODY} mt-5 max-w-[520px]`}>
              Short, practical ideas on nutrition, breathwork and everyday health.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href={instagramUrl} target="_blank" rel="noreferrer" className={BTN_DARK}>
              Follow on Instagram <ArrowRight size={14} />
            </a>
            {codes.length > 1 && (
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => scroller.current?.scrollBy({ left: -340, behavior: "smooth" })}
                  className="p-3 rounded-md border border-line text-ink hover:bg-card transition-colors cursor-pointer"
                  aria-label="Previous reels"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scroller.current?.scrollBy({ left: 340, behavior: "smooth" })}
                  className="p-3 rounded-md border border-line text-ink hover:bg-card transition-colors cursor-pointer"
                  aria-label="Next reels"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div ref={scroller} className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 sm:mx-0 sm:px-0">
          {codes.map((code) => (
            <div
              key={code}
              className="snap-start shrink-0 w-[min(88vw,340px)] h-[620px] rounded-xl overflow-hidden bg-card border border-line relative"
            >
              <span className="absolute inset-0 flex items-center justify-center text-[12px] tracking-[0.14em] uppercase text-faint">
                Loading reel…
              </span>
              <iframe
                src={`https://www.instagram.com/reel/${code}/embed/`}
                title="Instagram reel from HealthwithReshmi"
                loading="lazy"
                allow="encrypted-media; fullscreen; autoplay"
                allowFullScreen
                scrolling="no"
                className="relative w-full h-full border-0 bg-transparent"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
