/*
 * Build-time sitemap generator. Runs AFTER `vite build` (see package.json) and
 * writes dist/sitemap.xml — not public/, so nothing generated lies around in
 * dev or git.
 *
 * Sources URLs from GET /question/facets, so only (level, subject, type,
 * institution, year) combinations that actually have questions are listed.
 *
 * FAIL-OPEN: the API lives on Render and can be cold-starting mid-deploy. A
 * Vercel build must not fail because of it — on any fetch error this emits
 * the static core only, with a warning.
 */

const SITE_ORIGIN = "https://poruya.com";
// A two-question "paper" is a thin page; sitemap only lists combinations at
// or above this. Override with MIN_QUESTIONS env var.
const MIN_QUESTIONS = Number(process.env.MIN_QUESTIONS ?? 3);
const API_URL = process.env.VITE_PRODUCTION_API ?? "https://api.poruya.com";

const STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/question-bank",
];

// Sitemap spec caps a single file at 50,000 URLs; split well below that.
const SPLIT_AT = 45_000;

function xmlEscape(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

// encodeURI on the whole path, not encodeURIComponent per segment: it leaves
// "/", "_", "(", "'" alone and encodes spaces — which is what the browser
// puts in location.pathname, so the sitemap URL and the canonical match byte
// for byte.
function urlFor(path) {
  return xmlEscape(SITE_ORIGIN + encodeURI(path));
}

function urlEntry({ loc, lastmod }) {
  return (
    `  <url>\n` +
    `    <loc>${urlFor(loc)}</loc>\n` +
    (lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>\n` : "") +
    `  </url>`
  );
}

function toSitemap(entries) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join("\n") +
    `\n</urlset>\n`
  );
}

async function fetchFacets() {
  const res = await fetch(`${API_URL}/question/facets`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`facets endpoint answered ${res.status}`);
  const body = await res.json();
  if (!body?.success || !Array.isArray(body.data)) {
    throw new Error("facets endpoint returned an unexpected shape");
  }
  return body.data;
}

async function main() {
  const entries = STATIC_PATHS.map((loc) => urlEntry({ loc, lastmod: null }));

  let facetRows = [];
  try {
    facetRows = await fetchFacets();
  } catch (err) {
    // Render can be cold. Emit the static core rather than failing the deploy.
    console.warn(
      `[sitemap] facets unavailable (${err.message}); emitting static core only.`,
    );
  }

  // One URL per (level, subject) that has questions — the /question-bank/:slug1
  // pages — then one per facet at or above MIN_QUESTIONS for :slug2 pages.
  const slug1Pages = new Map(); // path -> lastmod
  for (const row of facetRows) {
    const slug1 = `/${row.level}_${row.subject}`;
    const lastmod = row.lastmod ?? null;
    if (
      !slug1Pages.has(slug1) ||
      (lastmod && slug1Pages.get(slug1) < lastmod)
    ) {
      slug1Pages.set(slug1, lastmod);
    }
  }
  for (const [path, lastmod] of slug1Pages) {
    entries.push(urlEntry({ loc: `/question-bank${path}`, lastmod }));
  }

  for (const row of facetRows) {
    if ((row.count ?? 0) < MIN_QUESTIONS) continue;
    entries.push(
      urlEntry({
        loc: `/question-bank/${row.level}_${row.subject}/${row.questionType}_${row.institution}_${row.year}`,
        lastmod: row.lastmod ?? null,
      }),
    );
  }

  if (entries.length > SPLIT_AT) {
    // Sitemap index: split into chunks of SPLIT_AT.
    const chunks = [];
    for (let i = 0; i < entries.length; i += SPLIT_AT) {
      chunks.push(entries.slice(i, i + SPLIT_AT));
    }
    const index = [];
    chunks.forEach((_, i) => {
      index.push(
        `  <sitemap>\n    <loc>${SITE_ORIGIN}/sitemap-${i + 1}.xml</loc>\n  </sitemap>`,
      );
    });
    const { writeFileSync } = await import("node:fs");
    chunks.forEach((chunk, i) => {
      writeFileSync(
        new URL(`../dist/sitemap-${i + 1}.xml`, import.meta.url),
        toSitemap(chunk),
      );
    });
    writeFileSync(
      new URL("../dist/sitemap.xml", import.meta.url),
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        index.join("\n") +
        `\n</sitemapindex>\n`,
    );
    console.log(`[sitemap] wrote index + ${chunks.length} files`);
  } else {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(
      new URL("../dist/sitemap.xml", import.meta.url),
      toSitemap(entries),
    );
    console.log(`[sitemap] wrote ${entries.length} URLs`);
  }
}

main().catch((err) => {
  // The generator itself must never fail a deploy.
  console.warn(`[sitemap] generation failed, skipping: ${err.message}`);
});
