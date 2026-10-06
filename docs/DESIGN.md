# HealthwithReshmi design system

"A warm apothecary journal on parchment": editorial wellness, calm and premium. Based on the Function
style reference (styles.refero.design), adapted with free fonts.

All tokens live in `src/index.css` (colours, fonts, shadows) and `src/components/home/ui.ts`
(type, buttons, cards, sections). Change them there and every page follows.

## Colour
| Token | Hex | Use |
|---|---|---|
| Parchment (`canvas`) | `#FEF9EF` | Page background. Never pure white. |
| Aged Paper (`surface`) | `#F5EEE1` | Cards and alternate sections. |
| Warm Taupe (`line`) | `#D1C9BF` | Hairlines, dividers, outlines. |
| Ink (`ink`) | `#2A2B2F` | Headings and primary text. |
| Charcoal (`muted`) | `#333333` | Body copy. |
| Graphite (`faint`) | `#515151` | Captions, helper text. |
| Ash (`ash`) | `#808988` | Form field borders only. |
| Terracotta Seal (`terracotta` / `accent`) | `#B05A36` | Only: primary buttons, eyebrow labels, active/selected states, icon strokes. |

One accent only. Don't add a second colour, and don't use terracotta for large areas or big text.

## Type
- **Headlines:** Newsreader (stand-in for Financier Display), regular weight. Pair roman with an
  *italic, lighter* word in the same line: write `Your health. <em>Your whole story.</em>`. The
  italic is the emotional word. Never italicise whole paragraphs or UI labels.
- **Everything else:** Inter (stand-in for Ftbase) with -0.023em tracking. 300 for large intro text,
  400 body, 600 buttons and labels.
- **Badges:** JetBrains Mono 11px caps, sparingly (`MONO`).
- Scale: eyebrow 12 · body 16-18 · subheading 20 · heading 34 · heading-lg 45 · display 56-64 · hero 84.
- The logo keeps its own script for "Reshmi" (`src/components/Brand.tsx`).

## Shape and space
- Cards 24px radius, buttons 40px (pill), inputs and tags fully round, nav items 12px.
- 8px grid; sections 64-96px apart; cards 32-40px padding; 1280px max width.
- Elevation comes from colour stepping (Parchment, then Aged Paper, then Taupe outline). Only two
  shadows: `--shadow-float` (menus, modals) and `--shadow-glow` (search, inputs).

## Components (in `ui.ts`)
`H1`, `H2`, `H3`, `EYEBROW`, `BODY`, `MONO`, `CARD`, `BTN_PRIMARY` (terracotta pill),
`BTN_OUTLINE` (terracotta outline pill), `BTN_ON_DARK` (for photos), `BTN_DARK`, and `Tags`
(inline list separated by a terracotta "·").

## Imagery
Warm, golden-hour, human photography. Full-bleed in heroes with a dark warm overlay (about 55-60%)
so parchment text stays readable; 24px rounded corners elsewhere. Outline icons, 1.5px stroke, in
terracotta or ink. Current photos are Unsplash placeholders and should be replaced with real ones.
