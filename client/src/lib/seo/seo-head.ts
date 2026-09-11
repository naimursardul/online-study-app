/*
 * The only module that touches document.head.
 *
 * It UPDATES the tags index.html already ships rather than appending new
 * ones. That is deliberate: React 19's native hoisting inserts a hoisted
 * <title> *before* the existing one (so it wins) but appends <meta>/<link>
 * *after* the static ones — the result would be two <meta name="description">
 * and two <link rel="canonical"> on every route, and when Google sees
 * conflicting canonicals it may ignore both and pick its own. Writing in
 * place gives exactly one tag per key, keeps the static values as the
 * fallback for crawlers that skip the edge, and is idempotent — which matters
 * because StrictMode double-invokes effects in dev.
 *
 * Do NOT render <title>, <meta> or <link> tags in JSX anywhere in the app —
 * React 19 will hoist them alongside these and the two writers will fight.
 */

import type { SeoHead } from "./seo-config";

function upsertMeta(
  kind: "name" | "property",
  key: string,
  content: string | null,
): void {
  const selector = `head > meta[${kind}="${key}"]`;
  const existing = document.querySelector<HTMLMetaElement>(selector);

  if (content === null) {
    // null means *remove*: this is what stops the noindex written on /login
    // from surviving a navigation to /.
    existing?.remove();
    return;
  }
  if (existing) {
    existing.setAttribute("content", content);
    return;
  }
  const el = document.createElement("meta");
  el.setAttribute(kind, key);
  el.setAttribute("content", content);
  document.head.appendChild(el);
}

function upsertLink(rel: string, href: string | null): void {
  const existing = document.querySelector<HTMLLinkElement>(
    `head > link[rel="${rel}"]`,
  );
  if (href === null) {
    existing?.remove();
    return;
  }
  if (existing) {
    existing.setAttribute("href", href);
    return;
  }
  const el = document.createElement("link");
  el.setAttribute("rel", rel);
  el.setAttribute("href", href);
  document.head.appendChild(el);
}

function writeJsonLd(nodes: object[]): void {
  // Remove the previous route's nodes, then add the new ones as a single tag.
  document
    .querySelectorAll('script[data-seo="route"]')
    .forEach((el) => el.remove());
  if (nodes.length === 0) return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.seo = "route";
  // textContent, never innerHTML — some JSON-LD values come straight out of
  // the URL, and textContent makes them inert by construction.
  script.textContent = JSON.stringify(nodes);
  document.head.appendChild(script);
}

function assertSingleTags(): void {
  if (import.meta.env.DEV) {
    const counts = {
      title: document.querySelectorAll("head > title").length,
      description: document.querySelectorAll(
        'head > meta[name="description"]',
      ).length,
      canonical: document.querySelectorAll(
        'head > link[rel="canonical"]',
      ).length,
    };
    for (const [tag, count] of Object.entries(counts)) {
      if (count !== 1) {
        // Someone probably rendered a <title>/<meta>/<link> in JSX and React
        // 19 silently hoisted a second one. See the header comment.
        console.warn(
          `[seo] expected exactly one <${tag}> in <head>, found ${count}. ` +
            "Do not render head tags in JSX — seo-head.ts owns them.",
        );
      }
    }
  }
}

/** Write a resolved SeoHead into the live document. Idempotent. */
export function applySeoHead(seo: SeoHead): void {
  document.title = seo.title;

  upsertMeta("name", "description", seo.description);
  upsertMeta("name", "robots", seo.robots);
  upsertLink("canonical", seo.canonical);

  upsertMeta("property", "og:title", seo.ogTitle);
  upsertMeta("property", "og:description", seo.ogDescription);
  upsertMeta("property", "og:url", seo.ogUrl);
  upsertMeta("name", "twitter:title", seo.twitterTitle);
  upsertMeta("name", "twitter:description", seo.twitterDescription);

  writeJsonLd(seo.jsonLd);

  assertSingleTags();
}
