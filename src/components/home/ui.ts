// Shared layout + type tokens for the home page (from the design spec sheet)
export const CONTAINER = "max-w-[1280px] mx-auto";
export const SECTION = "px-5 sm:px-8 py-[60px] md:py-[90px] lg:py-[120px]";
export const EYEBROW = "text-[11px] font-semibold tracking-[0.22em] uppercase text-accent";
export const H2 = "font-serif font-light text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.1] tracking-tight text-ink";
export const BODY = "text-[16px] sm:text-[17px] leading-relaxed text-muted";
export const BTN =
  "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md text-[12px] font-semibold tracking-[0.12em] uppercase transition-colors cursor-pointer no-underline";
export const BTN_PRIMARY = `${BTN} bg-terracotta text-white hover:bg-[#C27354]`;
export const BTN_OUTLINE = `${BTN} border border-ink text-ink hover:bg-ink hover:text-canvas`;
export const BTN_DARK = `${BTN} bg-ink text-canvas hover:opacity-90`;
