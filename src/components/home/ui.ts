// Shared design tokens: "warm apothecary journal on parchment".
// Serif headlines (roman + an italic accent word), Inter for everything else, one terracotta accent,
// generous rounding (24px cards, 40px pill buttons) and colour-stepped surfaces instead of shadows.
export const CONTAINER = "max-w-[1280px] mx-auto";
export const SECTION = "px-5 sm:px-8 lg:px-10 py-[64px] md:py-[80px] lg:py-[96px]";
export const EYEBROW = "text-[12px] font-semibold uppercase tracking-[0.02em] text-accent";
/** Tiny monospace label for badges ("FREE · 5 MINUTES") */
export const MONO = "font-mono text-[11px] uppercase tracking-normal text-faint";
export const H1 = "font-serif font-normal text-[48px] sm:text-[68px] lg:text-[84px] leading-[0.95] text-ink";
export const H2 = "font-serif font-normal text-[34px] sm:text-[45px] lg:text-[56px] leading-[1.08] text-ink";
export const H3 = "font-serif font-normal text-[26px] sm:text-[30px] leading-[1.15] text-ink";
export const BODY = "text-[16px] sm:text-[18px] font-light leading-[1.5] text-muted";
export const CARD = "bg-surface rounded-[24px] p-8 sm:p-10";
export const BTN =
  "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[40px] text-[15px] sm:text-[16px] font-semibold transition-colors cursor-pointer no-underline whitespace-nowrap";
export const BTN_PRIMARY = `${BTN} bg-terracotta text-parchment hover:bg-[#99492a]`;
export const BTN_OUTLINE = `${BTN} border-[1.5px] border-terracotta text-terracotta hover:bg-terracotta hover:text-parchment`;
/** Outline button for use on top of a dark photo */
export const BTN_ON_DARK = `${BTN} border-[1.5px] border-parchment/80 text-parchment hover:bg-parchment hover:text-ink`;
export const BTN_DARK = `${BTN} bg-ink text-parchment hover:opacity-90`;
/** Inline list item separated by a terracotta "·" (use inside a flex-wrap row) */
export const TAG = "text-[14px] text-muted";
