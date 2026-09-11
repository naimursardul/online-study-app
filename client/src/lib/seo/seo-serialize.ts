import type { SeoHead } from "./seo-config";

/*
 * Serialize a SeoHead to HTML for the edge middleware to inject between the
 * sentinel comments in index.html. The static tags inside the sentinels are
 * the no-edge fallback; everything here replaces them wholesale.
 */

function escapeAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** JSON-LD values come straight out of the URL; escape the script-breaking sequences. */
function escapeJsonLd(json: string): string {
  return json
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}

export function renderHeadTags(head: SeoHead): string {
  const lines: string[] = [];

  lines.push(`    <title>${escapeAttr(head.title)}</title>`);

  lines.push(
    `    <meta name="description" content="${escapeAttr(head.description)}" />`,
  );

  if (head.robots !== null) {
    lines.push(
      `    <meta name="robots" content="${escapeAttr(head.robots)}" />`,
    );
  }

  if (head.canonical !== null) {
    lines.push(
      `    <link rel="canonical" href="${escapeAttr(head.canonical)}" />`,
    );
  }

  lines.push(
    `    <meta property="og:title" content="${escapeAttr(head.ogTitle)}" />`,
  );
  lines.push(
    `    <meta property="og:description" content="${escapeAttr(head.ogDescription)}" />`,
  );
  if (head.ogUrl !== null) {
    lines.push(
      `    <meta property="og:url" content="${escapeAttr(head.ogUrl)}" />`,
    );
  }

  lines.push(
    `    <meta name="twitter:title" content="${escapeAttr(head.twitterTitle)}" />`,
  );
  lines.push(
    `    <meta name="twitter:description" content="${escapeAttr(head.twitterDescription)}" />`,
  );

  if (head.jsonLd.length > 0) {
    lines.push(
      `    <script type="application/ld+json" data-seo="route">${escapeJsonLd(
        JSON.stringify(head.jsonLd),
      )}</script>`,
    );
  }

  return lines.join("\n");
}
