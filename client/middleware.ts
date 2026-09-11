import { resolveSeo } from "./src/lib/seo/seo-routes";
import { renderHeadTags } from "./src/lib/seo/seo-serialize";

/*
 * Vercel Edge Middleware: rewrites the <head> of index.html per URL on every
 * request, so social previews, robots directives and real 404 status codes
 * work with JavaScript disabled.
 *
 * The resolver + serializer are pure and dependency-free (see
 * src/lib/seo/seo-config.ts for the edge-safety rules); tsconfig.middleware.json
 * enforces them at build time by omitting "vite/client" from `types`.
 */

export const config = {
  // Never intercept real files: hashed assets, favicon.svg, robots.txt,
  // sitemap.xml, og.png, and index.html itself (which we fetch below — the
  // matcher exclusion is what stops that fetch from re-entering the middleware).
  matcher: ["/((?!assets/|index\\.html$|.*\\.[a-zA-Z0-9]+$).*)"],
};

const SEO_START = "<!--seo:start-->";
const SEO_END = "<!--seo:end-->";

export default async function middleware(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);
  const head = resolveSeo(pathname);

  // Fail open: if index.html cannot be fetched or the sentinels are missing,
  // the user still gets a page. A broken preview beats a broken site.
  try {
    const shellResponse = await fetch(new URL("/index.html", request.url));
    const html = await shellResponse.text();

    const start = html.indexOf(SEO_START);
    const end = html.indexOf(SEO_END);
    if (start === -1 || end === -1 || end < start) {
      return shellResponse;
    }

    const injected =
      html.slice(0, start + SEO_START.length) +
      "\n" +
      renderHeadTags(head) +
      "\n    " +
      html.slice(end);

    const headers = new Headers(shellResponse.headers);
    // CDN-cached per URL for 5 minutes, then revalidate — the middleware is
    // not on the hot path.
    headers.set(
      "Cache-Control",
      "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
    );
    // Honoured before any JS runs — the noindex on private surfaces does not
    // depend on the SPA booting.
    if (head.robots !== null) {
      headers.set("X-Robots-Tag", head.robots);
    }

    return new Response(injected, {
      status: head.status,
      statusText: shellResponse.statusText,
      headers,
    });
  } catch {
    return fetch(request);
  }
}
