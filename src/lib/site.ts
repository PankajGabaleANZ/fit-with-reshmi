// Editable site content. Anything left empty simply doesn't render on the home page.

export const INSTAGRAM_HANDLE = "healthwithreshmi";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

// Latest reels (paste links; tracking parameters are ignored). Newest first.
export const INSTAGRAM_REEL_URLS: string[] = [
  "https://www.instagram.com/healthwithreshmi/reel/Ddtm1wMTrRn/",
  "https://www.instagram.com/healthwithreshmi/reel/Dc64WfQz5m6/",
  "https://www.instagram.com/healthwithreshmi/reel/DdW0ClVTnB7/",
  "https://www.instagram.com/healthwithreshmi/reel/Ddn47KGzbkl/",
];

// Pinned Instagram carousel shown in "How we work together" (paste its link; leave empty to hide).
export const PINNED_POST_URL = "";

// If the assessment already lives in a form (Google Form, Typeform...), paste its link here and the
// "Take the assessment" buttons will open it instead of the built-in version.
export const ASSESSMENT_FORM_URL = "";

// Real client testimonials only. The section stays hidden until at least one is added.
export interface Testimonial {
  quote: string;
  name: string;
  detail?: string;
}
export const TESTIMONIALS: Testimonial[] = [];

// Before / after photos for "My transformation" (paths under /public). Leave empty to hide.
export const TRANSFORMATION_PHOTOS: { src: string; alt: string; label: string }[] = [];

/** Instagram shortcode from a reel/post link, with or without the username segment. */
export function instagramCode(url: string): string | undefined {
  return url.match(/instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(?:reel|reels|p)\/([A-Za-z0-9_-]+)/)?.[1];
}
