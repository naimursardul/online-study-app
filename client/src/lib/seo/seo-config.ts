/*
 * Shared SEO configuration and helpers.
 *
 * EDGE-SAFE: this file is imported by client/middleware.ts, which runs on the
 * Vercel edge runtime. Do NOT import anything from utils.ts (it builds an
 * axios instance from import.meta.env at module scope), react-router, or
 * anything else that touches import.meta.env. Only type imports and
 * dependency-free modules are allowed. tsconfig.middleware.json omits
 * "vite/client" from `types` so a violation fails the build.
 */

// There is exactly one production origin; it is a fact about the product, not
// configuration. Hardcoding it also makes localhost and Vercel previews emit
// production canonicals, which is what we want.
export const SITE_ORIGIN = "https://poruya.com";

export const BRAND = "Poruya";

// Google truncates titles around 60 characters and descriptions around 160.
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;

/**
 * The complete managed head set. The browser writer (seo-head.ts) and the edge
 * serializer (seo-serialize.ts) both consume this, so they cannot disagree.
 * Every field is written on every route — `null` means *remove the tag*
 * (e.g. the `noindex` written on /login must not survive navigation to /).
 * Site-wide constants (charset, viewport, og:image, og:site_name, …) stay
 * static in index.html and are never touched.
 */
export interface SeoHead {
  title: string;
  description: string;
  /** robots directive, e.g. "index, follow" or "noindex, follow". */
  robots: string | null;
  canonical: string | null;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string | null;
  twitterTitle: string;
  twitterDescription: string;
  /** JSON-LD nodes, rendered into one script tag. Empty = no tag. */
  jsonLd: object[];
  /** HTTP status for the edge middleware; the browser writer ignores it. */
  status: 200 | 404;
}

/** Origin + path, trailing slash stripped so /about/ and /about cannot become two indexable URLs. */
export function absoluteUrl(path: string): string {
  const trimmed = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  return SITE_ORIGIN + trimmed;
}

/**
 * "X | Poruya" for most pages, bare for the homepage (its title *is* the
 * brand). The suffix is dropped when it would push the title past ~65 chars —
 * a truncated brand in a SERP reads worse than no brand.
 */
export function buildTitle(pageTitle: string, bare = false): string {
  if (bare) return pageTitle;
  const suffix = ` | ${BRAND}`;
  return pageTitle.length + suffix.length <= TITLE_MAX + 5
    ? pageTitle + suffix
    : pageTitle;
}

/** Collapse whitespace and cut on a word boundary at the description budget. */
export function clampDescription(text: string): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= DESCRIPTION_MAX) return collapsed;
  const cut = collapsed.slice(0, DESCRIPTION_MAX);
  const lastSpace = cut.lastIndexOf(" ");
  // A word boundary inside the final 20% is not worth an ugly cut.
  const boundary = lastSpace > DESCRIPTION_MAX * 0.8 ? lastSpace : cut.length;
  return cut.slice(0, boundary).trimEnd();
}
