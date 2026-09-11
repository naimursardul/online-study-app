# SEO and Metadata in This Project — A Complete Guide for Beginners

This document explains every SEO (Search Engine Optimization) idea used in this project. It
is written in easy English. Read it once from top to bottom. Then use the checklist at the
end when you add a new page.

---

## Table of contents

**Part 1 — The ideas (what and why)**

1. [What is SEO? The big picture](#1-what-is-seo-the-big-picture)
2. [Words you need to know](#2-words-you-need-to-know)
3. [The problems this project had](#3-the-problems-this-project-had)
4. [The architecture: three layers, one source of truth](#4-the-architecture-three-layers-one-source-of-truth)
5. [The route table](#5-the-route-table)
6. [The browser writer](#6-the-browser-writer)
7. [The edge middleware](#7-the-edge-middleware)
8. [JSON-LD — a business card for machines](#8-json-ld--a-business-card-for-machines)
9. [Sitemap, robots.txt, and the facets endpoint](#9-sitemap-robotstxt-and-the-facets-endpoint)
10. [Headings, images, and speed](#10-headings-images-and-speed)
11. [Checklist: how to add metadata for a new route](#11-checklist-how-to-add-metadata-for-a-new-route)

**Part 2 — The full code mechanism (how it really works)**

12. [The complete request lifecycle — two traces](#12-the-complete-request-lifecycle--two-traces)
13. [Line by line: seo-config.ts](#13-line-by-line-seo-configts)
14. [Line by line: board-slug.ts and the type registry](#14-line-by-line-board-slugts-and-the-type-registry)
15. [Line by line: seo-routes.ts](#15-line-by-line-seo-routests)
16. [Line by line: seo-head.ts](#16-line-by-line-seo-headts)
17. [Line by line: RouteSeo.tsx](#17-line-by-line-routeseotsx)
18. [Line by line: seo-serialize.ts](#18-line-by-line-seo-serializets)
19. [Line by line: middleware.ts](#19-line-by-line-middlewarets)
20. [Line by line: the sentinel block in index.html](#20-line-by-line-the-sentinel-block-in-indexhtml)
21. [Line by line: generate-sitemap.mjs](#21-line-by-line-generate-sitemapmjs)
22. [The server side: getQuestionFacets](#22-the-server-side-getquestionfacets)
23. [How tsconfig.middleware.json enforces edge-safety](#23-how-tsconfigmiddlewarejson-enforces-edge-safety)

---

# PART 1 — THE IDEAS (WHAT AND WHY)

## 1. What is SEO? The big picture

**SEO** means: helping Google (and Bing, and other search engines) understand your website,
so they show your pages to people who search for them.

Google does this with a **crawler** — a program ("Googlebot") that downloads your pages,
reads them, and stores them in an index. Think of it as a librarian who visits every page,
reads only the first impression, and decides: *what is this page about? Is it worth showing
to searchers?*

The crawler does not click buttons. It does not wait for slow things. It reads the HTML you
send, looks at a few special tags, and moves on. Those special tags live in the `<head>` of
your HTML, and they are called **metadata**.

### The special problem of a React SPA

This project is a **SPA** — a Single-Page Application. Vite builds *one* file,
`index.html`, and React draws every page inside it in the browser.

```
Traditional website:        /about    → about.html       (own <head>)
                            /contact  → contact.html     (own <head>)

React SPA:                  /about    → index.html  ─┐
                            /contact  → index.html  ─┴── SAME file, SAME <head>
                            /question-bank → index.html  (same again!)
```

Without extra work, every URL in a SPA has **the same title, the same description, the same
everything**. Google sees hundreds of URLs that all look identical. That is the problem this
whole system solves: give every URL its own correct metadata, even though the HTML file is
shared.

---

## 2. Words you need to know

| Word | Easy meaning |
|---|---|
| **SEO** | Search Engine Optimization. Making your pages easy for Google to understand and show. |
| **`<head>`** | The top part of an HTML page. Not visible on screen. Metadata lives here. |
| **Meta tag** | A `<meta>` tag in the head that describes the page: `<meta name="description" content="…">`. |
| **`<title>`** | The page title. Shown as the blue link in Google results and as the browser tab name. |
| **Description** | One-sentence summary of the page. Google often shows it under the title. |
| **Crawler / bot** | A program that reads your pages automatically. "Googlebot" is Google's crawler. |
| **SERP** | Search Engine Results Page. The list of results Google shows after a search. |
| **Canonical URL** | A tag that says: "of all near-identical URLs, THIS one is the official one." Prevents duplicates. |
| **robots / noindex** | A rule for crawlers. `noindex` = "do not put this page in Google." |
| **nofollow** | A rule that says "do not follow links from this page." Used on private pages. |
| **Soft 404** | A dead page that answers "200 OK" instead of "404 not found". It lies to Google. |
| **og: tags (Open Graph)** | Meta tags that social sites (Facebook, WhatsApp) read to build the preview card. |
| **Twitter card** | The same idea, for Twitter/X. `twitter:title`, `twitter:description`, `twitter:card`. |
| **JSON-LD** | Structured data. A JSON block in the page that describes the content in a machine format. |
| **Sitemap** | A file (`sitemap.xml`) that lists URLs you want Google to know about. |
| **robots.txt** | A small file at the site root that tells crawlers basic rules. |
| **Edge middleware** | Code that runs on Vercel's servers *before* the page is sent. It can change the HTML. |
| **CDN cache** | Vercel stores copies of pages close to users, so pages load faster. |
| **Core Web Vitals / LCP** | Google's speed measurements. LCP = how fast the main content appears. |

---

## 3. The problems this project had

Before this work, the site had these problems. Each one is worth understanding, because
each one teaches a rule.

**Problem 1 — One title for everything.**
Every page was "Poruya" in the browser tab and in Google. A user with 5 tabs open could not
tell them apart. Google could not tell what any page was about.

**Problem 2 — The canonical pointed at the homepage for every URL.**
Every page had `<link rel="canonical" href="https://poruya.com/">`. A canonical says "the
official version of this page is over there." So we were telling Google: *all our pages are
copies of the homepage.* Google may then keep only the homepage and drop everything else.
This was the most dangerous problem — an actively wrong signal is worse than a missing one.

**Problem 3 — Dead links returned 200 ("soft 404").**
`/question-bank/HSC_Physics-1st/WRONG_SLUG_HERE` rendered a broken page with a "200 OK"
status. Google indexes soft 404s, wastes its time on them, and learns your site is messy.

**Problem 4 — No sitemap, no robots.txt, no social image.**
Google had no list of URLs to discover. Anyone who shared a link on WhatsApp saw no title,
no description, no picture — just a raw URL.

**Problem 5 — Heading order and heavy images.**
Pages used `<h2>` with no `<h1>`. The about-page photo was **8 MB** — the single biggest
page-speed problem on the whole site (it became 51 KB after conversion).

---

## 4. The architecture: three layers, one source of truth

The fix is one table that describes every route, and three places that read it:

```
                 ┌──────────────────────────────┐
                 │  client/src/lib/seo/         │
                 │  seo-routes.ts               │
                 │  (THE table: every route's   │
                 │   title, description,        │
                 │   robots, canonical)         │
                 └──────────┬───────────────────┘
                            │  all three read the SAME function:
                            │  resolveSeo(pathname)
        ┌───────────────────┼─────────────────────┐
        v                   v                     v
  RouteSeo.tsx        client/middleware.ts   scripts/generate-
  (in the browser)    (on Vercel's edge)     sitemap.mjs
  updates the head    rewrites the head      writes sitemap.xml
  after React runs    BEFORE JavaScript       at build time
                       runs
```

Why this shape? Because the three readers serve three different customers:

| Layer | File | Who it serves | When it runs |
|---|---|---|---|
| Browser writer | `src/lib/seo/RouteSeo.tsx` | The user, while clicking around | Every route change |
| Edge middleware | `client/middleware.ts` | Google, Facebook, WhatsApp | Every page load, before JS |
| Sitemap generator | `client/scripts/generate-sitemap.mjs` | Google's discovery | Once per deploy |

All three call the **same** function: `resolveSeo(pathname)`. That is the key idea. If the
edge said "Log in | Poruya" and the browser said "Dashboard | Poruya" for the same URL,
Google would see two pages disagreeing. One function means they can never disagree.

### What "edge-safe" means

The middleware runs on Vercel's edge servers — small, fast computers that are **not** a
browser and **not** a full Node.js server. On the edge you cannot use:

- `import.meta.env` (a Vite browser feature)
- axios (the axios instance in `utils.ts` is built from `import.meta.env` at import time)
- react-router (browser routing)

So the SEO files must be **dependency-free** — pure string work. How do we make sure nobody
breaks that rule by accident? With a special TypeScript config:

```
client/tsconfig.middleware.json
  include: middleware.ts, seo-config.ts, seo-routes.ts,
           seo-serialize.ts, board-slug.ts, questionTypes.ts
  types: []          ← no "vite/client", so import.meta.env fails here
```

If you add `import.meta.env` to an edge-safe file, the **build fails**. We tested this on
purpose: adding one line broke the build; removing it fixed the build. Rules that a computer
enforces are rules that stay true.

---

## 5. The route table

File: `client/src/lib/seo/seo-routes.ts`

The table lists every route with its metadata. It mirrors the route list in `App.tsx`, in
the same order. A shortened entry looks like this:

```ts
const ROUTES: RouteEntry[] = [
  {
    pattern: "/contact",
    head: head({
      title: "Contact us",
      description: "Questions, feedback or account trouble? Email contact@poruya.com…",
      canonicalPath: "/contact",
    }),
  },
  {
    pattern: "/question-bank/:slug1",
    resolve: (p) => questionBankSlug1(p.slug1!),  // computed per URL
  },
  // …
];
```

- Simple pages use `head: …` — fixed values.
- Pages with URL parameters use `resolve: …` — a function that builds the metadata from the
  params (the title of `/question-bank/HSC_Physics-1st` contains "HSC Physics-1st").

`resolveSeo` walks the table, first match wins, and the last entry is `*` (matches
everything) — that is the 404.

### 5.1 noindex for private pages

`noindex` tells Google: "do not put this page in your index."

- `/login`, `/signup`, `/forgot-password` — nobody searches for our login page; Google
  should show the homepage instead.
- `/dashboard`, `/collection`, `/collections/:id` — **private user data**. These must never
  appear in Google. They also get `nofollow`.
- `/admin/*` — one table entry covers the admin area and all its children.
- `/exam`, `/doubt`, `/question-explorer` — either login-only or placeholder pages. They get
  `noindex` **for now**, with a comment saying when to flip them to `index`.

Honesty is a rule here: a page with placeholder text ("Lorem ipsum") must be `noindex`.
Google remembers thin pages, and trust is slow to rebuild.

Why does a noindex page get **no canonical**? A canonical says "this URL is the official
version of a real page." On a private page that claim is false. `noindex` alone is clear;
`noindex` + canonical sends two messages that fight each other.

```ts
function noIndexHead(title: string, description: string, nofollow = false): SeoHead {
  return head({
    title, description,
    canonicalPath: null,                                    // never a canonical
    robots: nofollow ? "noindex, nofollow" : "noindex, follow",
  });
}
```

### 5.2 The canonical is built from the pattern, not the raw URL

These URLs all show the same page:

```
/ABOUT                      (uppercase)
/about/                     (trailing slash)
/about?utm_source=facebook  (tracking parameter)
```

Google may treat each as a **separate page** with **duplicate content**. The canonical
solves this: it names the one official URL. So `/ABOUT` must say
`<link rel="canonical" href="https://poruya.com/about">` — pointing at the clean form.

How? The matcher compares segments case-insensitively, and the canonical is built by
substituting the params back into the **clean pattern**, never from `location.pathname`:

```ts
// matchPath compares lowercase, but keeps the original case for params:
params[patSeg.slice(1)] = pathSeg;

// The canonical uses the matched pattern + params — not the raw URL the user typed.
canonicalPath: `/question-bank/${slug1}`,
```

Result: `/QUESTION-BANK/hsc_physics-1st` and `/question-bank/HSC_Physics-1st` both get the
canonical `https://poruya.com/question-bank/HSC_Physics-1st`. One page in Google, not many.

### 5.3 Validity guards — no fake pages

A question-bank URL has a grammar:

```
/question-bank/:slug1/:slug2
   slug1 = level_subject          e.g. HSC_Physics-1st
   slug2 = type_institution_year  e.g. MCQ_Dhaka_2024
```

The resolver checks the grammar before trusting the URL:

```ts
// slug1 must be exactly 2 non-empty parts…
const valid = parts.length === 2 && Boolean(level) && Boolean(subject);
// …and slug2 exactly 3, with a known type code and a plausible year.
const valid =
  parts.length === 3 &&
  isQuestionTypeCode(questionType) &&
  Boolean(institution) &&
  YEAR_RE.test(year ?? "");
```

If the grammar is broken, the page gets `noindex`, **status 404**, and no canonical — a real
"not found", not a thin duplicate page. This matters more than it looks: a malformed slug2
used to make the page's query skip empty filters and show *every* question of that subject.
Thousands of near-empty pages, all indexable. The guard stops that whole family of URLs.

The parser that splits slugs (`client/src/utils/board-slug.ts`) knows the two slugs are one
grammar — slug2's parts sit at positions 2–4, not 0–2:

```ts
parseBoardSlug("HSC_Physics-1st")          // → { level: "HSC", subject: "Physics-1st" }
parseBoardSlug("MCQ_Dhaka_2024", "questionType")
                                          // → { questionType: "MCQ", institution: "Dhaka", year: "2024" }
```

---

## 6. The browser writer

Files: `client/src/lib/seo/RouteSeo.tsx` (mounted once in `App.tsx`) and
`client/src/lib/seo/seo-head.ts`

When the user clicks a link, React Router changes the URL without reloading the page. The
`<head>` does not change by itself. `RouteSeo` is a component that listens to the location
and rewrites the head:

```tsx
export default function RouteSeo() {
  const location = useLocation();
  const seo = useMemo(() => resolveSeo(location.pathname), [location.pathname]);
  useEffect(() => { applySeoHead(seo); }, [seo]);
  return null; // renders nothing — it only writes the head
}
```

It is mounted **once**, inside `<BrowserRouter>`, not inside every page. Why: some pages are
behind a loading gate, and `<Navigate>` redirects happen before a page mounts — a single
location-driven writer handles all cases at the same moment.

### Update in place, never append

`applySeoHead` **updates** the tags that `index.html` already ships. It never adds a second
`<title>` or a second `<meta name="description">`. Why this matters:

- Two descriptions = Google picks one at random (or ignores both).
- Two canonicals = Google may ignore both and choose its own — the worst outcome.
- React 19's native hoisting would do exactly this if we rendered `<title>` in JSX — so the
  rule is: **never render `<title>`, `<meta>` or `<link>` in JSX anywhere in the app.**
  `seo-head.ts` owns them.

### `null` means *remove*

Every field is written on **every** route change. When a value is `null`, the tag is
**removed**:

```ts
if (content === null) {
  // null means *remove*: this is what stops the noindex written on /login
  // from surviving a navigation to /.
  existing?.remove();
  return;
}
```

The story behind this: you visit `/login`, which writes `<meta name="robots"
content="noindex, follow">`. Then you click "Home". If the writer only *updated* fields, the
`noindex` would still sit in the head of the homepage — telling Google not to index the
homepage! Writing every field every time, with `null` = remove, makes mistakes like this
impossible.

---

## 7. The edge middleware

File: `client/middleware.ts`

This is the layer that fixes the SPA's core problem. Recall: Facebook, WhatsApp, and many
crawlers **never run JavaScript**. They read the HTML you send and stop. For them, a React
SPA looks like one empty page.

**Edge middleware** runs on Vercel's server, on every request, *between* the user and the
file. It can change the HTML before sending it. So: send the correct `<head>` per URL in the
first response — no JavaScript needed.

```
Browser asks for /question-bank/HSC_Physics-1st
        |
        v
[middleware runs on Vercel's edge]
  1. resolveSeo("/question-bank/HSC_Physics-1st")  → title, description, canonical…
  2. fetch index.html (the built SPA shell)
  3. replace the tags between the sentinel comments
  4. send it with the right status code and headers
        |
        v
Browser/Facebook/Googlebot receives HTML that already
has the right title, description and canonical.
```

### The sentinel comments

`index.html` contains two HTML comments that mark where the per-route tags go:

```html
<!--seo:start-->
  <title>…</title>
  <meta name="description" content="…" />
  <link rel="canonical" href="…" />
  …
<!--seo:end-->
```

The middleware finds the comments and replaces everything between them:

```ts
const start = html.indexOf(SEO_START);
const end = html.indexOf(SEO_END);
if (start === -1 || end === -1) return shellResponse; // sentinels missing → normal page

const injected =
  html.slice(0, start + SEO_START.length) + "\n" +
  renderHeadTags(head) + "\n    " +
  html.slice(end);
```

The static tags inside the sentinels are the **fallback** — if the middleware fails, the
page still ships a sane head.

### Real 404 status

The middleware answers with `status: head.status`. A garbage URL now gets a true HTTP 404,
not a soft 404. Google understands 404 and moves on.

### The X-Robots-Tag header

```ts
if (head.robots !== null) {
  headers.set("X-Robots-Tag", head.robots);
}
```

`X-Robots-Tag` is the same rule as the robots meta tag, but sent as an HTTP **header**.
Some crawlers read headers before they even parse HTML. This way the `noindex` on private
pages does not depend on JavaScript running.

### Fail-open thinking

Look at the `catch`:

```ts
} catch {
  return fetch(request); // something broke → just serve the normal page
}
```

The whole middleware is wrapped so that if anything fails, the user still gets the normal
SPA. **A broken preview is better than a broken site.** This is called *fail-open*, and it
is the right default for anything optional — metadata is optional; the page is not.

One more detail: the matcher pattern excludes real files
(`assets/…`, `robots.txt`, `sitemap.xml`, `og.png`, `index.html` itself). Without that, the
middleware would try to rewrite the favicon too, and the internal `fetch("/index.html")`
would re-enter the middleware forever.

---

## 8. JSON-LD — a business card for machines

Meta tags describe a page in *words*. **JSON-LD** describes it in *structure*: a JSON block
that says "this page is an Organization, its name is X, its URL is Y."

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Poruya",
  "url": "https://poruya.com"
}
</script>
```

Think of it as a business card written in a format all machines agree on (the agreement is
the schema.org vocabulary). Google can use it for "rich results" — extra features in search
listings.

### What this project uses — three types, each with a reason

**1. Organization** (on the homepage) — "this site belongs to this organization."

**2. WebSite** (on the homepage, linked to the Organization by `@id`) — "this is the website
of that organization." Linking entities by `@id` helps Google connect them.

```ts
// seo-routes.ts — Organization + WebSite, linked by @id, on / only.
const SITE_JSON_LD = [
  { "@type": "Organization", "@id": `${absoluteUrl("/")}#organization`,
    name: "Poruya", url: absoluteUrl("/"), email: "contact@poruya.com" },
  { "@type": "WebSite", "@id": `${absoluteUrl("/")}#website`,
    url: absoluteUrl("/"), name: "Poruya",
    publisher: { "@id": `${absoluteUrl("/")}#organization` }, inLanguage: "en" },
];
```

**3. BreadcrumbList** (on question-bank pages) — tells Google the page's place in the site
structure: Question Bank → HSC Physics-1st → Dhaka 2024 MCQ. Google may show this trail in
the result instead of the raw URL.

### What we deliberately did NOT add — and why

Being honest with Google also means not claiming things that are not true:

- **No FAQPage markup** — Google deprecated FAQ rich results for most sites in 2023. It
  would be markup for a feature that no longer exists.
- **No Quiz markup** — our answers are not visible in the HTML for anonymous visitors (they
  come from the API after login). Quiz markup with hidden answers would be a false claim.

Rule: structured data must describe what is really on the page. Google penalizes fake
markup more than it rewards extra markup.

---

## 9. Sitemap, robots.txt, and the facets endpoint

### The facets endpoint — knowing which pages exist

There are thousands of possible question-bank URLs, but only some have questions. Listing
empty URLs in the sitemap would send Google to thin pages. So the server offers one special
endpoint:

```
GET /question/facets
```

It asks MongoDB: "group all questions by level, subject, type, institution, year, and give
me the count and the newest date for each group." The result is cached in **Redis** for one
hour (TTL 3600s), so the heavy database work happens at most once per hour instead of on
every deploy. If Redis is down, the endpoint still answers from the database — fail-open.

### The sitemap generator

File: `client/scripts/generate-sitemap.mjs` — runs after `vite build` (see the `build`
script in `client/package.json`):

1. Add the static pages: `/`, `/about`, `/contact`, `/terms`, `/privacy`, `/question-bank`.
2. Fetch `/question/facets` from the API.
3. One URL per (level, subject) that has questions → the `/question-bank/:slug1` pages.
4. One URL per facet **with at least 3 questions** (`MIN_QUESTIONS = 3`) → the `:slug2`
   pages, with `lastmod` = when that paper last changed. A two-question "paper" is too thin
   to advertise.
5. If the list grows past 45,000 URLs, split it into several files plus a sitemap index
   (the spec caps one file at 50,000).

**Fail-open here too:** the API lives on Render and may be asleep during a deploy. If the
fetch fails or times out, the generator writes the static core and prints a warning — it
never fails the deploy. (Tested live: with the API down, the build finished with the 6
static URLs.)

### robots.txt — keep it tiny

File: `client/public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://poruya.com/sitemap.xml
```

That is the whole file. It says: everyone may crawl everything except `/admin`, and here is
the sitemap. `noindex` (per page) handles the private user pages; robots.txt only needs to
block the one area that should never even be fetched.

---

## 10. Headings, images, and speed

### Headings — like a book's chapters

- Every page has exactly **one `<h1>`** — the page's name. Then `<h2>` for sections,
  `<h3>` for subsections, in order, with no levels skipped.
- Crawlers use heading order to understand page structure, like a table of contents.
- This project had pages starting at `<h2>` (no `<h1>`) — fixed by making the main page
  heading an `<h1>`.

### The social preview image

`og.png` (1200×630) is the picture Facebook/WhatsApp show with a shared link. Without it,
shares show a blank card or a random screenshot. Referenced site-wide in `index.html`:

```html
<meta property="og:image" content="https://poruya.com/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
```

`width`/`height` are included so the browser/social site can reserve space and does not
have to download the image to know its size.

### Image speed — the 8 MB lesson

The about-page photo was 8 MB. Converting it to **webp** made it 51 KB — about 160×
smaller. WebP is a modern image format: same look, much smaller file.

Every image now also gets:

```tsx
<img src="/aboutme.webp" alt="Naimur Rahman"
     width={250} height={250} loading="lazy" />
```

- `width` and `height` → the browser reserves the exact space. The page does not "jump"
  while loading. (Google calls a jump "layout shift" and penalizes it.)
- `loading="lazy"` → images below the screen are only downloaded when the user scrolls near
  them.

Speed is SEO: Google's ranking includes Core Web Vitals, and a giant image is the easiest
thing on a page to get wrong.

---

## 11. Checklist: how to add metadata for a new route

Follow these steps, in order:

1. **Add the route in `App.tsx`** as usual.
2. **Add an entry to the `ROUTES` table** in `client/src/lib/seo/seo-routes.ts`, in the
   same position as in `App.tsx`. A missing entry silently inherits the 404 metadata — and
   nothing warns you, because falling through is also what a real 404 does.
3. Write a **title** under ~60 characters. Google cuts longer ones.
4. Write a **description** in one or two sentences, under ~160 characters. It must honestly
   describe the page.
5. Decide **robots**: is the page public and finished? Then the default (`index, follow`)
   is fine. Is it private, login-only, or placeholder? Use `noIndexHead(...)` and leave a
   comment saying what must change before it can be indexed.
6. Set the **canonical** to the clean pattern path (`canonicalPath: "/your/route"`), not
   to the homepage, and not to the raw URL.
7. Does the page have URL parameters with a grammar (like the question-bank slugs)? Write a
   `resolve` function **with a validity guard** that returns a 404 head for malformed input.
8. Ask: is the main heading of the page an `<h1>`? Is there exactly one?
9. If the route is a main content page, consider JSON-LD — but only a type that truthfully
   matches the content. Never invent markup.
10. **Never** render `<title>`, `<meta>` or `<link>` in JSX — `seo-head.ts` owns the head,
    and two writers will fight each other.

### Quick review questions

- Does every public page have its own title, description, and self-canonical?
- Does any page claim a canonical that is not its own clean URL?
- Could any malformed URL render an indexable near-empty page?
- Does a private page carry `noindex` **and** no canonical?
- If the middleware or the sitemap step failed, would the site still work? (It must.)

---

*Sources in this repo: `client/src/lib/seo/seo-routes.ts`, `client/src/lib/seo/seo-config.ts`,
`client/src/lib/seo/seo-head.ts`, `client/src/lib/seo/seo-serialize.ts`,
`client/src/lib/seo/RouteSeo.tsx`, `client/middleware.ts`, `client/tsconfig.middleware.json`,
`client/index.html`, `client/scripts/generate-sitemap.mjs`, `client/public/robots.txt`,
`server/src/controllers/question-controller.ts` (facets).*

---

# PART 2 — THE FULL CODE MECHANISM

Part 1 told you *what* each layer does. Part 2 opens every file and shows *how*, line by
line. New words are explained the first time they appear.

## 12. The complete request lifecycle — two traces

Before the code, the two journeys a request can take. Everything in Part 2 is a detail of
one of these two pictures.

### Trace A — a Facebook bot opens a link (no JavaScript ever runs)

Someone pastes `https://poruya.com/question-bank/HSC_Physics-1st` into WhatsApp. Facebook's
crawler fetches the URL to build the preview card.

| Step | Where | What happens |
|---|---|---|
| 1 | Facebook's server | Sends `GET /question-bank/HSC_Physics-1st`. No browser, no JavaScript. |
| 2 | Vercel edge | The `matcher` config checks: is this URL a real file? It is not (no dot, not assets/) → the middleware runs. |
| 3 | `middleware.ts` | `resolveSeo("/question-bank/HSC_Physics-1st")` → `{ title: "HSC Physics-1st board questions", … }`. Pure string work, no database, no React. |
| 4 | `middleware.ts` | `fetch("/index.html")` — gets the built SPA shell (the static file Vercel already serves). |
| 5 | `middleware.ts` | Finds the `<!--seo:start-->` and `<!--seo:end-->` comments, replaces everything between them with the resolved tags. |
| 6 | `middleware.ts` | Builds the response: injected HTML + `Cache-Control` + `X-Robots-Tag` + status 200. |
| 7 | Facebook's server | Reads `<title>`, `og:title`, `og:description`, `og:image` **from the HTML** and builds the preview card. |

The SPA itself never runs. The JavaScript bundle is never downloaded. If this machinery did
not exist, step 7 would read the homepage's tags for every URL on the site.

### Trace B — a user in a real browser

1. The user opens the same URL. Steps 1–6 of Trace A happen again — the browser also
   receives the injected HTML. The tab title is correct **immediately**, before React
   boots.
2. The browser downloads the JavaScript bundle and React starts ("boots").
3. React Router matches `/question-bank/:slug1` and renders the page component.
4. `RouteSeo` (mounted once in `App.tsx`) sees the location and calls
   `resolveSeo(location.pathname)` — the **same function** as step 3 of Trace A.
5. `applySeoHead` writes the resolved values into the live `<head>` — updating the same
   tags in place. The values are identical to what the edge injected, so the user sees no
   flicker; the title does not change.
6. The user clicks a sidebar link. React Router changes the URL without a page reload.
   Step 4–5 repeat. The head now shows the *new* page's metadata.

That "same function" is the whole design: trace A and trace B can never disagree.

---

## 13. Line by line: seo-config.ts

File: `client/src/lib/seo/seo-config.ts` — the shared foundation. It defines the head
"contract" that every other SEO file obeys.

### Chunk 1 — constants

```ts
export const SITE_ORIGIN = "https://poruya.com";

export const BRAND = "Poruya";

// Google truncates titles around 60 characters and descriptions around 160.
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;
```

**Line by line:**

- `SITE_ORIGIN` — the one true address of the site. Every canonical, every og:url, every
  sitemap URL is built from it. The comment in the real file explains why it is
  **hardcoded** and not an environment variable: there is exactly one production origin.
  It is a fact about the product, not a setting. Hardcoding also means localhost and
  Vercel preview deployments emit **production** canonicals — which is correct: those
  preview URLs are temporary, and Google must only ever see the real origin.
- `BRAND` — appended to titles ("Log in | Poruya").
- `TITLE_MAX = 60` / `DESCRIPTION_MAX = 160` — Google's display limits. Longer titles get
  cut with "…" in the results page. A named constant beats a magic number scattered
  through the code.

### Chunk 2 — the SeoHead interface, field by field

```ts
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
```

**Field by field — this interface is the contract:**

- `title`, `description` — the basics every page has.
- `robots: string | null` — the crawler rule. `null` means "no robots tag at all" (the
  default is to index, so most pages could omit it — but see the null-rule below).
- `canonical: string | null` — the official URL. `null` means "remove the tag" (private
  and 404 pages).
- `ogTitle`, `ogDescription`, `ogUrl` — the Open Graph copies for social previews.
  Duplicated on purpose: social sites read og: tags, Google reads title/description, and
  they can legitimately differ (we currently keep them equal).
- `twitterTitle`, `twitterDescription` — same for Twitter/X.
- `jsonLd: object[]` — structured data nodes. Empty array = no script tag.
- `status: 200 | 404` — an HTTP concern, so only the edge middleware uses it. The browser
  writer ignores it. A single type serves both worlds.

**The golden rule of this interface:** every field is written on **every** route, and
`null` means **remove the tag**. Why so strict? Because the browser writer updates tags
*in place* as the user navigates. If a field could be "skipped", the value from the
*previous* page would survive — e.g. the `noindex` from `/login` leaking onto `/`. Writing
every field every time makes leaking impossible (you will see the code in section 16).

### Chunk 3 — absoluteUrl

```ts
/** Origin + path, trailing slash stripped so /about/ and /about cannot become two indexable URLs. */
export function absoluteUrl(path: string): string {
  const trimmed = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  return SITE_ORIGIN + trimmed;
}
```

**Line by line:**

- `path.endsWith("/") && path !== "/"` — two conditions: the path ends with a slash, AND
  it is not just `/` (the homepage *is* `/`, and stripping it would give an empty string).
- `? path.slice(0, -1) : path` — if both are true, drop the last character (the slash).
- The result: `/about/` and `/about` both become `https://poruya.com/about`. One URL, not
  two. Google treats those as different pages by default — this one line collapses them.

### Chunk 4 — buildTitle

```ts
export function buildTitle(pageTitle: string, bare = false): string {
  if (bare) return pageTitle;
  const suffix = ` | ${BRAND}`;
  return pageTitle.length + suffix.length <= TITLE_MAX + 5
    ? pageTitle + suffix
    : pageTitle;
}
```

**Line by line:**

- `bare = false` — most pages get "Page | Poruya". The homepage gets `bare: true`, because
  its title *is* the brand: "Poruya — Practise real board questions". Adding "| Poruya"
  would read "Poruya — Practise real board questions | Poruya".
- `pageTitle.length + suffix.length <= TITLE_MAX + 5` — only append the brand if the total
  stays inside the budget (60 + a little tolerance). The comment in the real file says why:
  a brand name **cut in half** by Google ("…Practice real board questions | Por") looks
  worse than no brand at all.
- The ternary returns either `pageTitle + suffix` or just `pageTitle` — one expression, no
  `if` statement.

### Chunk 5 — clampDescription

```ts
export function clampDescription(text: string): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= DESCRIPTION_MAX) return collapsed;
  const cut = collapsed.slice(0, DESCRIPTION_MAX);
  const lastSpace = cut.lastIndexOf(" ");
  // A word boundary inside the final 20% is not worth an ugly cut.
  const boundary = lastSpace > DESCRIPTION_MAX * 0.8 ? lastSpace : cut.length;
  return cut.slice(0, boundary).trimEnd();
}
```

**Line by line:**

- `text.replace(/\s+/g, " ")` — a **regular expression**: `\s+` means "one or more
  whitespace characters" (space, tab, newline); the `g` flag means "all of them". They all
  become one plain space. Descriptions written in code with line wrapping become one
  clean line.
- `.trim()` — remove leading/trailing space.
- The early return: short enough? Done. Nothing cut.
- `cut = collapsed.slice(0, 160)` — the hard cut. But `slice` cuts mid-word:
  "…target your weak top" — ugly.
- `lastSpace = cut.lastIndexOf(" ")` — where the last complete word ends.
- `boundary = lastSpace > 160 * 0.8 ? lastSpace : cut.length` — the judgment call. If the
  last space is in the final 20% of the text, cutting there loses too many characters for
  the beauty gain, so keep the hard cut. If it is earlier, cut at the word boundary. A
  pro detail: not every rule is absolute — you weigh the trade-off and write down where
  the line is.
- `.trimEnd()` — the boundary cut leaves a trailing space; remove it.

> **The trick to remember:** seo-config is the *contract*: one origin, one budget, one
> head shape, and every field always written.

---

## 14. Line by line: board-slug.ts and the type registry

These two small files feed the resolver with parsed slugs and known type codes.

### board-slug.ts — the positional grammar

File: `client/src/utils/board-slug.ts`

```ts
export function parseBoardSlug(
  slug: string,
  startAt: keyof BoardSlugParts = "level",
): BoardSlugParts {
  const keys: (keyof BoardSlugParts)[] = [
    "level",
    "subject",
    "questionType",
    "institution",
    "year",
  ];
  const parts: BoardSlugParts = {};
  if (!slug) return parts;
  const offset = keys.indexOf(startAt);
  const arr = slug.split("_");
  keys.slice(offset).forEach((key, i) => {
    const value = arr[i];
    if (value) parts[key] = value;
  });
  return parts;
}
```

**Line by line:**

- The **grammar** (in the real file's comment): slug1 = `HSC_Physics-1st` (level,
  subject), slug2 = `MCQ_Dhaka_2024` (type, institution, year). Positional means "the
  meaning comes from the position, separated by `_`". Position 0 is always the level…
  in slug1. In slug2, position 0 is the *type*, because slug2 continues the same grammar
  at position 2.
- `startAt: keyof BoardSlugParts = "level"` — the offset dial. Default `"level"`
  (positions start at 0). Callers parsing slug2 pass `"questionType"`.
- `const keys = [...]` — the grammar as an array: the five positions in order.
- `if (!slug) return parts;` — an empty slug gives empty parts. No crash.
- `const offset = keys.indexOf(startAt);` — where to start reading. `"questionType"` is at
  index 2.
- `const arr = slug.split("_");` — `"MCQ_Dhaka_2024"` becomes `["MCQ", "Dhaka", "2024"]`.
- `keys.slice(offset).forEach((key, i) => …)` — pair the *grammar positions we care
  about* with the *slug parts* by index. With offset 2: `questionType`←`"MCQ"`,
  `institution`←`"Dhaka"`, `year`←`"2024"`.
- `if (value) parts[key] = value;` — skip empty strings. A trailing `_` or an empty part
  is simply not stored. (The resolvers count parts separately to detect malformed slugs —
  this function parses, it does not judge.)
- Why does this tiny function exist in its own file? The comment in the real file
  explains: the SEO resolver runs on the Vercel edge. The old home of this logic,
  `utils.ts`, creates an axios instance at module scope — which the edge cannot load. So
  the slug parser moved into a dependency-free file both worlds can import.

### questionTypes.ts — the registry (the parts SEO uses)

File: `client/src/utils/questionTypes.ts` (a longer file; here are the two functions the
resolver calls):

```ts
export const QUESTION_TYPE_CODES = ["MCQ", "CQ", "Math-CQ", "SQ", "EQ", "WQ"] as const;

export type QuestionTypeCode = (typeof QUESTION_TYPE_CODES)[number];

export function isQuestionTypeCode(value: unknown): value is QuestionTypeCode {
  return (
    typeof value === "string" &&
    (QUESTION_TYPE_CODES as readonly string[]).includes(value)
  );
}

export function labelOf(code: string): string {
  return isQuestionTypeCode(code) ? QUESTION_TYPES[code].label : code;
}
```

**Line by line:**

- `as const` — makes the array's types exact ("MCQ" | "CQ" | …) instead of just
  `string[]`. Then `(typeof QUESTION_TYPE_CODES)[number]` builds the union type
  `QuestionTypeCode` *from the array itself*. Add a code to the array, and every type
  updates automatically. One source of truth, even for the types.
- `isQuestionTypeCode(value): value is QuestionTypeCode` — another **type guard** (like
  `axios.isAxiosError` in the error document). At runtime it checks "is this string in the
  list?". For TypeScript, the `value is QuestionTypeCode` return type means: after this
  check passes, treat `value` as a known code.
- `labelOf(code)` — turn a code into a human label for titles: `"SQ"` → `"Short
  Question"`. If the code is unknown, return it unchanged — never crash, never show
  "undefined".

---

## 15. Line by line: seo-routes.ts

File: `client/src/lib/seo/seo-routes.ts` — the big one. Four parts: the path matcher, the
head builders, the question-bank resolvers, and the route table.

### Chunk 1 — matchPath, the setup

```ts
function matchPath(pattern: string, pathname: string): MatchResult | null {
  const pat = pattern.toLowerCase().replace(/\/+$/, "") || "/";
  const path = pathname.replace(/\/+$/, "") || "/";
  const patParts = pat.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  const params: Record<string, string> = {};
```

**Line by line:**

- Why does this function exist at all? Because the edge cannot import react-router, and
  react-router's `matchPath` is not edge-safe. So: ~25 lines doing only what this app
  needs — matching `:param` segments and a trailing `*`.
- `pattern.toLowerCase()` — the **pattern** is lowered ("/QUESTION-BANK" in `App.tsx`
  should still match), but notice: `pathname` is **not** lowered. That asymmetry is
  deliberate — see chunk 2.
- `.replace(/\/+$/, "")` — the regex means "one or more slashes at the end of the string"
  (`$` = end). Removed. `|| "/"` — if the result is empty (the path was just "/"), use
  "/".
- `split("/").filter(Boolean)` — `/about//` splits to `["", "about", "", ""]`; the filter
  drops every empty string. Double slashes and trailing slashes all normalize to the same
  parts. Note `pathParts` keeps the **original case** (`"HSC"` stays `"HSC"`).
- `params` — the output box for values pulled out of the URL.

### Chunk 2 — matchPath, wildcard and comparison

```ts
  const isWildcard = patParts[patParts.length - 1] === "*";
  const patSegs = isWildcard ? patParts.slice(0, -1) : patParts;

  if (isWildcard) {
    // Prefix match: /admin/* matches /admin and /admin/anything.
    if (pathParts.length < patSegs.length) return null;
  } else {
    if (pathParts.length !== patSegs.length) return null;
  }

  for (let i = 0; i < patSegs.length; i++) {
    const patSeg = patSegs[i];
    const pathSeg = pathParts[i];
    if (patSeg.startsWith(":")) {
      if (!pathSeg) return null;
      // Original case: params feed the canonical and the type-code check,
      // both of which must preserve what the user actually typed.
      params[patSeg.slice(1)] = pathSeg;
    } else if (patSeg !== pathSeg.toLowerCase()) {
      return null;
    }
  }
  return { params };
```

**Line by line:**

- `isWildcard` — is the last pattern segment `*`? `/admin/*` is the one wildcard route.
  `slice(0, -1)` removes it before comparing.
- Wildcard rule: the path must have **at least** the fixed segments (`/admin/x/y` matches,
  `/ad` does not). Non-wildcard rule: **exactly** the same number of segments — `/about`
  must not match `/about/extra`.
- The loop compares segment by segment:
- `patSeg.startsWith(":")` — a parameter slot like `:slug1`. Grab the path segment into
  `params`, **keeping its original case** (`patSeg.slice(1)` removes the colon; that is
  the param name). Why original case matters: the canonical URL for
  `/question-bank/HSC_Physics-1st` must say `HSC_Physics-1st`, not `hsc_physics-1st`. The
  type-code check also needs the real value ("MCQ" not "mcq" — the registry codes are
  case-sensitive).
- `patSeg !== pathSeg.toLowerCase()` — a fixed segment matches case-insensitively:
  `/ABOUT` matches `/about`. Compare lowercased, never lowercase the stored value. This
  one line is what makes every URL variant collapse into one canonical.
- `return { params }` — matched. The caller gets the params to build the head.

### Chunk 3 — the head builder and noIndexHead

```ts
function head(o: HeadOptions): SeoHead {
  const canonical = o.canonicalPath ? absoluteUrl(o.canonicalPath) : null;
  return {
    title: buildTitle(o.title, o.bare),
    description: clampDescription(o.description),
    robots: o.robots ?? "index, follow",
    canonical,
    ogTitle: o.title,
    ogDescription: clampDescription(o.description),
    ogUrl: canonical,
    twitterTitle: o.title,
    twitterDescription: clampDescription(o.description),
    jsonLd: o.jsonLd ?? [],
    status: o.status ?? 200,
  };
}

function noIndexHead(
  title: string,
  description: string,
  nofollow = false,
): SeoHead {
  return head({
    title,
    description,
    canonicalPath: null,
    robots: nofollow ? "noindex, nofollow" : "noindex, follow",
  });
}
```

**Line by line:**

- `head(o)` — one factory that turns loose options into a complete, clamped `SeoHead`.
  Callers never assemble a `SeoHead` by hand, so no caller can forget the description
  clamp or mismatch og:url and canonical.
- `o.canonicalPath ? absoluteUrl(…) : null` — the path→URL conversion happens here, once.
  `null` passes through as `null` (remove).
- `o.robots ?? "index, follow"` — `??` (nullish coalescing): "use the given value, or
  this default when it is null/undefined". Public pages can simply omit robots.
- `ogUrl: canonical` — the social URL is the canonical. They are the same concept: "the
  official address of this page."
- `noIndexHead(…)` — the private-page shortcut: `noindex`, **no canonical ever** (the
  reasoning is in Part 1, section 5.1), and a `nofollow` switch for the truly private
  pages (dashboard, admin).

### Chunk 4 — the slug resolvers

```ts
const YEAR_RE = /^(19|20)\d{2}$/;

function questionBankSlug1(slug1: string): SeoHead {
  const { level, subject } = parseBoardSlug(slug1);
  const parts = slug1.split("_").filter(Boolean);

  const valid =
    parts.length === 2 && Boolean(level) && Boolean(subject);
  if (!valid) {
    return head({
      title: "Page not found",
      description: NOT_FOUND_DESCRIPTION,
      canonicalPath: null,
      robots: "noindex, follow",
      status: 404,
    });
  }

  const title = `${level} ${subject} board questions`;
  const description = `Every ${level} ${subject} board paper on Poruya — pick an institution and year from the sidebar to open the full paper, question by question.`;

  return head({
    title,
    description,
    canonicalPath: `/question-bank/${slug1}`,
    jsonLd: [breadcrumbJsonLd(slug1, null)],
  });
}
```

**Line by line:**

- `YEAR_RE = /^(19|20)\d{2}$/` — a year is exactly 4 digits starting with 19 or 20.
  Anchors `^…$` mean the whole string must match — "20244" fails, "2024" passes.
- `parseBoardSlug(slug1)` — split into level + subject.
- `parts.length === 2` — the validity guard. `HSC_Physics-1st_MCQ` (3 parts) is malformed:
  it is the shape of a *different* URL jammed into this one. The page would render
  something, so the honest answer is `noindex` + **status 404** + no canonical — the
  "Page not found" head. (Why the page still renders is Part 1, section 5.3: the app is
  forgiving; the SEO layer must not be.)
- The valid branch: title and description built from the parsed values — **this is the
  whole point of the system**. The metadata names the exact page.
- `canonicalPath: /question-bank/${slug1}` — the canonical uses the param as it came from
  the match (original case, clean pattern). Not `location.pathname` — that is what
  collapses `/QUESTION-BANK/hsc_physics-1st?utm=x` into
  `https://poruya.com/question-bank/HSC_Physics-1st`.
- `jsonLd: [breadcrumbJsonLd(slug1, null)]` — the breadcrumb trail (chunk 6).

`questionBankSlug2(slug1, slug2)` follows the same shape with a stricter guard — exactly
three parts, a **known type code** (`isQuestionTypeCode`), an institution, and a year that
passes `YEAR_RE`:

```ts
  const { questionType, institution, year } = parseBoardSlug(
    slug2,
    "questionType",
  );
  const valid =
    parts.length === 3 &&
    isQuestionTypeCode(questionType) &&
    Boolean(institution) &&
    YEAR_RE.test(year ?? "");
```

Note `parseBoardSlug(slug2, "questionType")` — the offset dial from section 14 in action.
Without it, `MCQ` would be read as a *level* and `Dhaka` as a *subject*. (This exact bug
existed for a day: `/question-bank/HSC_Physics-1st/MCQ_Dhaka_2024` resolved as a 404
because "Dhaka" failed the year check. The offset parameter is the fix.)

### Chunk 5 — SITE_JSON_LD

```ts
const SITE_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organization`,
    name: "Poruya",
    url: absoluteUrl("/"),
    email: "contact@poruya.com",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    url: absoluteUrl("/"),
    name: "Poruya",
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
    inLanguage: "en",
  },
];
```

**Line by line:**

- Two nodes in one array — they will be rendered into **one** `<script type="application/ld+json">`
  tag. Multiple entities in one block is normal JSON-LD.
- `"@context": "https://schema.org"` — the vocabulary declaration: "the words I use next
  (`@type`, `name`, `publisher`) are defined at schema.org."
- `"@id": …#organization` — a **node ID**. Like a username for an entity. It lets the
  second node point at the first one:
- `publisher: { "@id": …#organization }` — the WebSite says "the organization with that ID
  publishes me". Now Google *knows* the two nodes are connected — not just two random
  blocks that happen to mention Poruya. Linking entities by `@id` is how structured data
  becomes a graph instead of isolated cards.
- What is deliberately absent (the real file's comment says): no `logo` (claiming an
  official logo in schema before the asset is stable can do more harm than good) and no
  `SearchAction` (the app's search input has no handler — markup must not claim features
  that do not work).

### Chunk 6 — breadcrumbJsonLd

```ts
function breadcrumbJsonLd(slug1: string, slug2: string | null): object {
  const { level, subject } = parseBoardSlug(slug1);
  const { questionType, institution, year } = slug2
    ? parseBoardSlug(slug2, "questionType")
    : {};

  const items: object[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Question Bank",
      item: absoluteUrl("/question-bank"),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: `${level} ${subject}`,
      item: absoluteUrl(`/question-bank/${slug1}`),
    },
  ];

  if (slug2) {
    const label = isQuestionTypeCode(questionType)
      ? labelOf(questionType)
      : questionType;
    items.push({
      "@type": "ListItem",
      position: 3,
      name: `${institution} ${year} ${label}`,
      item: absoluteUrl(`/question-bank/${slug1}/${slug2}`),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
```

**Line by line:**

- The breadcrumb is the trail Google may show in the result: `Question Bank › HSC
  Physics-1st › Dhaka 2024 MCQ`. Each `ListItem` has a `position` (1, 2, 3), a `name`
  (the visible label), and an `item` (the URL of that step).
- `slug2 ? parseBoardSlug(slug2, "questionType") : {}` — the ternary handles both pages:
  a slug1 page has no third crumb. Destructuring `{}` gives undefined values, which are
  never read because of the `if (slug2)` guard.
- `labelOf(questionType)` — `"MCQ"` would render as "MCQ" anyway, but `"SQ"` becomes
  "Short Question" — readable in search results.
- The slug1 page reuses this function with `slug2 = null` — one function, both trails.

### Chunk 7 — the route table and resolveSeo

```ts
type RouteEntry =
  | { pattern: string; head: SeoHead }
  | {
      pattern: string;
      resolve: (params: Record<string, string>) => SeoHead;
    };
```

**Line by line:**

- A **union type**: every table entry is one of two shapes. Simple routes carry a
  ready-made `head`. Parameter routes carry a `resolve` function that builds the head
  from the URL params. TypeScript will *force* you to check which shape you got before
  reading `.head` or `.resolve` — wrong access is a compile error.

```ts
export function resolveSeo(pathname: string): SeoHead {
  for (const entry of ROUTES) {
    const match = matchPath(entry.pattern, pathname);
    if (!match) continue;
    if ("head" in entry) return entry.head;
    return entry.resolve(match.params);
  }
  // Unreachable: the "*" entry matches everything. Kept for safety.
  return head({
    title: "Page not found",
    description: NOT_FOUND_DESCRIPTION,
    canonicalPath: null,
    robots: "noindex, follow",
    status: 404,
  });
}
```

- `for (const entry of ROUTES)` — walk the table top to bottom. **First match wins** —
  which is why the table keeps the same order as `App.tsx`: reading one is reading the
  other.
- `if (!match) continue;` — this pattern does not fit this URL; try the next.
- `if ("head" in entry) return entry.head;` — the union-type check in action: `"head" in
  entry` proves the shape, then the right field is read.
- `return entry.resolve(match.params);` — parameter routes get their params.
- The last entry of `ROUTES` is `pattern: "*"` — it matches everything, so the loop always
  returns inside it. The final `return` after the loop is unreachable — and still written,
  with a comment saying why. **Defensive programming**: if someone ever deletes the `*`
  entry, the function still returns a valid, safe head instead of `undefined` and a crash
  on the edge.

> **The trick to remember:** one table, first match wins, a `*` at the end, and a
> safety net under the safety net.

---

## 16. Line by line: seo-head.ts

File: `client/src/lib/seo/seo-head.ts` — the only module in the app allowed to touch
`document.head`.

### Chunk 1 — upsertMeta

```ts
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
```

**Line by line:**

- "Upsert" = **up**date or in**sert** — one word for both. The function has three exits,
  and the order matters:
- `kind: "name" | "property"` — meta tags come in two families:
  `<meta name="description">` and `<meta property="og:title">`. The kind decides which
  attribute to select and set.
- `const selector = \`head > meta[${kind}="${key}"]\`` — a **CSS selector** built at
  runtime: `head > meta[name="description"]`. The `>` means "direct child only" — tags
  nested deeper (none should be) are ignored.
- `document.querySelector<HTMLMetaElement>(selector)` — find the tag if it exists. The
  `<HTMLMetaElement>` generic tells TypeScript what kind of element comes back.
- **Exit 1** — `content === null` → **remove** the tag (`existing?.remove()` — the `?.`
  does nothing when there was no tag). This is the "null means remove" rule from the
  contract, in code. Without it, the `noindex` written on `/login` would survive the
  navigation to `/` — a single missing line that could deindex the homepage.
- **Exit 2** — the tag exists → **update it in place** (`setAttribute("content", …)`).
  Never delete-and-recreate: in-place update is what guarantees there is always exactly
  one tag.
- **Exit 3** — no tag at all → **create** it and append it. This exit normally never runs
  (index.html ships all of them inside the sentinels), but it makes the function
  self-healing if a tag is missing.

The real file's header comment explains why React's own mechanism is not used: React 19
"hoists" `<title>`/`<meta>` rendered in JSX into the head — but inserts a hoisted title
*before* the static one (so it wins) while appending metas *after* the static ones (so
there are two). Two canonicals make Google ignore both. Hence the file's rule, in caps in
the real comment: **do not render `<title>`, `<meta>` or `<link>` in JSX anywhere in the
app.**

### Chunk 2 — upsertLink

```ts
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
```

- Identical three-exit structure to `upsertMeta`, for `<link>` tags (the canonical).
  Same pattern, different element. Recognizing *that it is the same pattern* is half of
  reading code like a pro.

### Chunk 3 — writeJsonLd

```ts
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
```

**Line by line:**

- `querySelectorAll('script[data-seo="route"]')` — find **every** script tag we marked.
  The `data-seo="route"` attribute is our marker: "this tag belongs to the SEO system."
  Marking what you create lets you find and clean up exactly your own tags later.
- `.forEach((el) => el.remove())` — remove the previous route's JSON-LD. Unlike metas
  (update in place), JSON-LD is wholesale-replaced: the new route's nodes have nothing in
  common with the old ones.
- `if (nodes.length === 0) return;` — a route with no structured data ends with *no*
  tag (we removed the old one and add nothing). Correct: an empty `<script>` tag is
  invalid JSON-LD.
- `script.dataset.seo = "route"` — sets `data-seo="route"`. (`dataset` is the JavaScript
  API for `data-*` attributes.)
- `script.textContent = JSON.stringify(nodes)` — **the security line.** Some JSON-LD
  values come straight out of the URL (the institution name in a slug, for example). A
  malicious visitor could craft a URL like
  `/question-bank/HSC_X/<script>alert(1)</script>_2024`. With `innerHTML`, that string
  would become a **live script element** — that is XSS (cross-site scripting: injecting
  your own JavaScript into someone else's page). With `textContent`, it stays **plain
  text** — visible if anyone printed it, but never executed. "Inert by construction"
  means the safe behavior is impossible to get wrong, not just correctly implemented.
- The upsert pattern is unnecessary here but StrictMode-safe by construction: remove all,
  then add one.

### Chunk 4 — assertSingleTags and applySeoHead

```ts
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
        console.warn(
          `[seo] expected exactly one <${tag}> in <head>, found ${count}. ` +
            "Do not render head tags in JSX — seo-head.ts owns them.",
        );
      }
    }
  }
}
```

**Line by line:**

- `if (import.meta.env.DEV)` — only in development. This is a **self-check**: after
  writing, count the important tags. Each must be exactly 1. If someone renders a
  `<title>` in JSX and React hoists a second one, this warning fires in the dev console
  immediately — the bug is caught the moment it is written, not two weeks later in
  production.
- `for (const [tag, count] of Object.entries(counts))` — destructure each pair and check.
  A checker like this is cheap insurance for a rule that cannot be enforced by the
  compiler.

```ts
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
```

- `document.title = seo.title` — the title is special: there is exactly one, and it has
  its own assignment. No upsert needed.
- Every `SeoHead` field, written every time — the contract executed. `seo.robots` may be
  `null` → the upsert *removes* the tag. `seo.canonical` may be `null` → same. Look how
  the "every field every route" rule makes this function have no conditionals: the values
  decide, the code just writes.
- `assertSingleTags()` last — check after writing.

> **The trick to remember:** upsert means one tag per key forever; `null` removes;
> `textContent` keeps URL data inert; and a dev-only self-check catches rule breakers
> early.

---

## 17. Line by line: RouteSeo.tsx

File: `client/src/lib/seo/RouteSeo.tsx` — thirty lines that connect the router to the
writer.

```tsx
export default function RouteSeo() {
  const location = useLocation();
  const seo = useMemo(() => resolveSeo(location.pathname), [location.pathname]);

  useEffect(() => {
    applySeoHead(seo);
  }, [seo]);

  return null;
}
```

**Line by line:**

- `const location = useLocation();` — a react-router hook. Every URL change gives the
  component a new `location` object and re-renders it. This component renders nothing —
  it exists purely to *react* to location changes.
- `useMemo(() => resolveSeo(location.pathname), [location.pathname])` — **memoization**:
  "remember this answer, and only recompute when the pathname changes." Two effects:
  (1) performance — resolving is cheap, but no work is free work, and this runs on every
  navigation; (2) correctness — `useMemo` returns the *same object* between renders when
  the pathname has not changed, which matters for the next line:
- `useEffect(() => { applySeoHead(seo); }, [seo])` — run the writer when `seo` changes.
  The dependency is the memoized object, so the effect fires exactly once per navigation
  — not on every unrelated re-render. (Depend on the value, not on the function that
  makes it.)
- `return null;` — a component that renders nothing into the page. Legal and common for
  "observer" components like this one.

**Why is it mounted once, at the top?** The real file's comment gives three reasons, each
worth understanding:

1. Pages under the service layout sit behind a loading gate (`masterDataLoading`). A
   page-level SEO component would mount *late* — after the data arrives — and the title
   would flip late, exactly on the routes that need it most.
2. React runs **child effects before parent effects** (bottom-up). If an ancestor wrote
   the head and a child page also wrote it, the order would depend on tree depth — a race
   written into the layout. One writer, no race.
3. `ProtectedRoute` renders `<Navigate to="/login">` — the protected page *never mounts*.
   A page-level writer would never run; the head would still say the old page's title. A
   location-driven writer follows the redirect automatically.

**StrictMode and idempotency.** In development, React StrictMode runs every effect
**twice** on mount (to surface bugs). `applySeoHead` must therefore be **idempotent**
— running it twice must produce the same result as running it once. The upsert design
makes it so: the second run updates the same tags to the same values. No duplicate tags,
no flicker. This is a general law: anything you do in a `useEffect` should be safe to do
twice.

---

## 18. Line by line: seo-serialize.ts

File: `client/src/lib/seo/seo-serialize.ts` — the edge's version of the writer. The
browser edits a *live DOM*; the edge produces an *HTML string*. Same values, different
medium.

### Chunk 1 — the two escapers

```ts
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
```

**Line by line:**

- `escapeAttr` — text going **inside an HTML attribute** (`content="…"`) must not contain
  the characters that *end* an attribute or start a tag: `&`, `<`, `>`, `"`. Each is
  replaced with its **HTML entity** (`&amp;` etc.) — the browser displays the original
  character, but the string can never break out of the attribute. Why does this matter?
  Titles contain data from URLs (`Dhaka 2024 MCQ — HSC Physics-1st`). A crafted URL could
  otherwise inject `"><script>…` into the head. Escaping makes the injection harmless —
  the same XSS thinking as `textContent` in section 16.
- `escapeJsonLd` — a **different** rule for a different context. Inside a
  `<script>` tag, `"` and `<` are legal — but the sequence `</script>` *ends the script
  tag*, even in the middle of a string. So `<`, `>`, `&` are replaced with their JSON
  **unicode escapes**: six characters — a backslash followed by `u003c`. In JSON
  string syntax that sequence *means* the `<` character — a JSON parser reading the block
  gives you the original text back. But the HTML parser scanning for `</script>` never
  sees the raw `<` at all. Same goal (injection-proof), different mechanism per context —
  that is the pro insight: escaping is context-specific, never copy-paste one escaper
  everywhere.

### Chunk 2 — renderHeadTags

```ts
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
```

- The function builds an **array of lines**, then `join`s them. Lines for robots,
  canonical, and og:url are only pushed when not null — the same null-means-absent rule
  as the DOM writer, expressed as "do not emit the line" instead of "remove the tag".
- Every dynamic value passes through `escapeAttr` on the way in. No exceptions — that is
  the difference between "usually safe" and safe.
- The output ends with `return lines.join("\n");` — one HTML block that the middleware
  splices between the sentinels. The four-space indentation matches index.html, so the
  served file looks hand-written (view-source stays readable — a small professional
  courtesy).

---

## 19. Line by line: middleware.ts

File: `client/middleware.ts` — the edge rewriter.

### Chunk 1 — the matcher

```ts
export const config = {
  // Never intercept real files: hashed assets, favicon.svg, robots.txt,
  // sitemap.xml, og.png, and index.html itself (which we fetch below — the
  // matcher exclusion is what stops that fetch from re-entering the middleware).
  matcher: ["/((?!assets/|index\\.html$|.*\\.[a-zA-Z0-9]+$).*)"],
};
```

**Line by line — the regex, piece by piece.** Vercel runs the middleware only for URLs
the matcher accepts. The pattern is one big regular expression:

- `/` — the URL must start with a slash (all paths do).
- `(?!…)` — a **negative lookahead**: "the rest must NOT start with what follows."
  Everything inside it is a forbidden prefix/pattern:
  - `assets/` — Vite's hashed build files (`/assets/index-a1b2c3.js`). The middleware
    must never rewrite a JavaScript file.
  - `index\\.html$` — the shell itself, and `$` anchors it to the end. This exclusion is
    load-bearing, and the comment says why: **the middleware fetches `/index.html`
    internally.** If that fetch matched the middleware, the middleware would call
    itself… forever. One regex alternative prevents an infinite loop.
  - `.*\\.[a-zA-Z0-9]+$` — "anything ending in a dot followed by letters/digits":
    `robots.txt`, `sitemap.xml`, `og.png`, `favicon.svg`, `site.webmanifest`. The
    general rule "a dot-extension at the end means a real file" catches them all without
    listing each one.
- `.*` — everything else: the app's routes. These get the middleware.

### Chunk 2 — the sentinels and the splice

```ts
const SEO_START = "<!--seo:start-->";
const SEO_END = "<!--seo:end-->";

export default async function middleware(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);
  const head = resolveSeo(pathname);

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
```

**Line by line:**

- `new URL(request.url)` → `pathname` — parse the request URL. (`new URL(...)` is the
  standard string parser for URLs; reading `.pathname` gives the path without the
  origin.)
- `resolveSeo(pathname)` — the same resolver as the browser. On the edge it runs in
  **microseconds** (pure string work, no database) — that is why the whole system was
  designed around a pure resolver.
- `await fetch(new URL("/index.html", request.url))` — fetch the SPA shell *from
  ourselves*. `new URL(path, base)` builds "https://this-host/index.html". This is the
  fetch the matcher's `index.html$` exclusion protects from re-entering.
- `html.indexOf(SEO_START)` — find where the sentinel block begins. `indexOf` returns
  `-1` when not found.
- The guard `start === -1 || end === -1 || end < start` — if either sentinel is missing
  (or out of order — a mangled index.html), **return the shell untouched**. The head
  stays the static default: wrong metadata beats no page. Fail-open again.
- The splice, read carefully:
  - `html.slice(0, start + SEO_START.length)` — everything **up to and including** the
    start comment (note: `+ SEO_START.length`, so the comment itself is kept).
  - `+ "\n" + renderHeadTags(head) + "\n    "` — the fresh tags.
  - `+ html.slice(end)` — everything from the end comment onward (comment kept, rest of
    the file kept).
  
  The old static tags between the sentinels are simply **not copied** — they are replaced
  wholesale.

### Chunk 3 — headers and the response

```ts
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
```

**Line by line:**

- `new Headers(shellResponse.headers)` — copy the shell's headers into a **mutable**
  copy, then set ours. Starting from the copy (not an empty set) keeps anything the
  platform added (content-type, etag…).
- `Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=86400` — four
  directives, each a sentence to the caches:
  - `public` — "any cache may store this" (Vercel's CDN, proxies).
  - `max-age=0` — "the **browser** should not reuse this without checking." Browsers get
    fresh metadata per URL.
  - `s-maxage=300` — "shared caches (the CDN) may reuse it for **300 seconds**." The
    middleware work is done once per URL per 5 minutes, not on every request.
  - `stale-while-revalidate=86400` — "after that, you may serve the stale copy for up to
    a day, **while** you refresh it in the background." Users get instant responses even
    when the cache entry expired; the next user gets the fresh one.
- `X-Robots-Tag` — the robots rule again, as an **HTTP header** instead of a meta tag.
  Crawlers that read only headers (and some read headers first) get the same rule. Two
  signals, one source (`head.robots`), zero disagreement.
- `status: head.status` — the real 404. This is the soft-404 fix from Part 1 in one
  property.
- `} catch { return fetch(request); }` — the fail-open net. Any failure anywhere above →
  fetch the original request as if the middleware did not exist → the user gets the
  normal SPA. The comment above the `try` says the principle out loud: **a broken preview
  beats a broken site.**

> **The trick to remember:** resolve fast, splice between sentinels, set honest headers
> and status, and on any failure serve the plain page.

---

## 20. Line by line: the sentinel block in index.html

File: `client/index.html` — the file all three layers revolve around. Two zones:

```html
    <!-- Site-wide social constants — identical on every route, so they are
         never touched by the SEO writers (browser or edge). -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Poruya" />
    <meta property="og:image" content="https://poruya.com/og.png" />
    <meta property="og:image:alt" content="Poruya" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
    <link rel="manifest" href="/site.webmanifest" />
```

**Line by line:**

- These sit **above** the sentinels and are never rewritten. They are the same on every
  page: the social image, the site name, the icons, the manifest. Splitting "constant"
  from "per-route" tags is the boundary of the whole system — the writers only own the
  per-route block.
- `og:image` + width + height — the preview picture with its size declared, so social
  sites can lay out the card before downloading the image.

```html
    <!--
      The block between the seo sentinels is REWRITTEN PER REQUEST by
      client/middleware.ts on Vercel (see src/lib/seo/), and per navigation by
      RouteSeo in the browser. The static tags below are the no-edge fallback
      for anything that bypasses both — do NOT "clean them up" by deleting
      them; the writers update these exact elements in place.
    -->
    <!--seo:start-->
    <title>Poruya — Practise real board questions</title>
    <meta name="description" content="A Bangladeshi board and admission question bank…" />
    <link rel="canonical" href="https://poruya.com/" />
    <meta property="og:title" content="Poruya — Practise real board questions" />
    …
    <!--seo:end-->
```

- Inside the sentinels: the per-route tags — title, description, canonical, og:title,
  og:description, og:url, twitter:title, twitter:description. Exactly the eight fields
  of `SeoHead` (plus robots and JSON-LD when present).
- The static values are the **homepage's** metadata, and they are the **fallback**: if
  the middleware is skipped, fails, or the file is served from a cache that bypasses the
  edge, the page still carries a sane head — the homepage's.
- The comment exists because these tags look like duplicates to a future cleanup-minded
  reader ("why are there two descriptions?"). Comments that say **why**, and warn about
  the tempting wrong "fix", are the comments that earn their place.

---

## 21. Line by line: generate-sitemap.mjs

File: `client/scripts/generate-sitemap.mjs` — runs after `vite build` (see the `build`
script in `client/package.json`). `.mjs` means "this file is a Node ES module."

### Chunk 1 — configuration

```js
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
```

**Line by line:**

- `MIN_QUESTIONS` — the thin-page threshold. `process.env.MIN_QUESTIONS ?? 3` reads an
  environment variable so the deploy can tune it without a code change; `Number(...)`
  converts the string env values to a number; `?? 3` defaults when unset. Three
  techniques in one line, each worth knowing.
- `STATIC_PATHS` — the pages that always exist. Note which are missing: `/login`,
  `/signup` (noindex — never advertised), `/dashboard` (private).
- `SPLIT_AT = 45_000` — the sitemap **spec** (the official format description) caps one
  file at 50,000 URLs. We split at 45k — a margin, because off-by-one at a hard spec
  limit is a bad place to learn.

### Chunk 2 — urlFor and escaping

```js
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
```

**Line by line:**

- `xmlEscape` — the same escaping idea as section 18, but for **XML** (the sitemap format
  is XML, not HTML): five entities, including `'` (`&apos;`), which XML requires and HTML
  does not. Context-specific escaping again.
- The comment is the deep one. There are two ways to build the URL:
  `encodeURI(wholePath)` (encodes spaces but keeps `/`, `_`, `(`, `'`) versus
  `encodeURIComponent(segment)` (encodes everything, including `/` → `%2F`). The
  **canonical** (from `absoluteUrl`) uses the raw path; the browser shows
  `location.pathname` with `encodeURI`-style encoding. If the sitemap used
  `encodeURIComponent`, the same page would appear as
  `/question-bank/HSC_Physics-1st` in the canonical but
  `/question-bank%2FHSC_Physics-1st` in the sitemap — two different-looking URLs for one
  page. **Byte-for-byte matching** between sitemap and canonical is the requirement; the
  choice of encoder is how you get it.

### Chunk 3 — fetchFacets

```js
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
```

**Line by line:**

- `AbortSignal.timeout(30_000)` — a built-in way to create an abort signal that fires
  after 30 seconds. Same AbortController idea as the error document, without needing the
  controller object. The deploy must not hang forever on a sleeping server.
- `if (!res.ok) throw` — `res.ok` is true for 2xx. Anything else is an error — throw,
  and the caller's `catch` (chunk 5) handles it.
- The shape check — `body?.success` and `Array.isArray(body.data)` — trust nothing. If
  the API ever changes its response shape, the generator fails loudly (in the log) rather
  than quietly writing a broken sitemap.

### Chunk 4 — building the URL list

```js
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
```

**Line by line:**

- **Two kinds of pages, two loops.** First: one `/question-bank/level_subject` page per
  (level, subject). Many facet rows share the same (level, subject) — the subject page
  must be listed **once**.
- `new Map()` — the dedup machine. A `Map` holds key→value pairs and a key can only
  exist once. Using the slug1 path as the key automatically collapses duplicates.
- `(lastmod && slug1Pages.get(slug1) < lastmod)` — when the same page appears in several
  rows, keep the **newest** lastmod ("when did any question on this page last change?").
  `<` on ISO date strings works because ISO dates sort alphabetically = chronologically.
- Second loop: one `/question-bank/slug1/slug2` page per facet — but only when
  `(row.count ?? 0) >= MIN_QUESTIONS`. `?? 0` treats a missing count as zero. The
  thin-page filter from the config, applied.
- `lastmod` in a sitemap tells Google "only re-crawl this page if it changed since then."
  Honest lastmod = efficient crawling. Fake lastmod (always "today") = Google learns to
  distrust your sitemap.

### Chunk 5 — fail-open, twice

```js
  let facetRows = [];
  try {
    facetRows = await fetchFacets();
  } catch (err) {
    // Render can be cold. Emit the static core rather than failing the deploy.
    console.warn(
      `[sitemap] facets unavailable (${err.message}); emitting static core only.`,
    );
  }
```

- If the API is asleep (Render cold start), the catch runs: warn in the build log, keep
  `facetRows = []`, continue. The sitemap gets the six static URLs — small but valid. The
  next deploy (API awake) fills it again. A deploy must never fail because an optional
  data source was unavailable.

```js
main().catch((err) => {
  // The generator itself must never fail a deploy.
  console.warn(`[sitemap] generation failed, skipping: ${err.message}`);
});
```

- The second net, around `main` itself: any unexpected crash anywhere in the script →
  warn and exit successfully. If this `catch` did not exist, a bug in the script would
  fail `npm run build` and block the whole deploy — for a sitemap. Proportionality: how
  much damage should each failure be allowed to cause?

(The splitting logic — chunks of 45,000 plus a sitemap index file — is straightforward
array slicing; read it in the file when the site grows past 45k URLs.)

> **The trick to remember:** dedup with a Map, filter thin pages, match the canonical
> byte-for-byte, and never let an optional step fail the deploy.

---

## 22. The server side: getQuestionFacets

File: `server/src/controllers/question-controller.ts` — where the sitemap's data comes
from. One endpoint: `GET /question/facets`.

### Chunk 1 — the aggregation pipeline

```ts
  const grouped = await BaseQuestion.aggregate<{…}>([
    { $unwind: "$recordId" },
    {
      $group: {
        _id: {
          levelId: "$levelId",
          subjectId: "$subjectId",
          questionType: "$questionType",
          recordId: "$recordId",
        },
        count: { $sum: 1 },
        lastmod: { $max: "$updatedAt" },
      },
    },
  ]);
```

**Line by line:**

- `.aggregate([...])` — a MongoDB **aggregation pipeline**: a list of stages; each
  stage transforms all documents and passes them to the next. Think of an assembly line.
- `{ $unwind: "$recordId" }` — `recordId` is an **array** on each question (a question
  can belong to several papers). `$unwind` turns one document with array `[a, b]` into
  two documents, one with `a`, one with `b`. Now each row means "this question belongs to
  paper X" exactly once.
- `{ $group: { _id: { levelId, subjectId, questionType, recordId }, count: { $sum: 1 },
  lastmod: { $max: "$updatedAt" } } }` — group the (unwound) documents by the four
  fields together. `_id` in a `$group` is "the thing to group by" — here an object of
  four values, so each unique combination becomes one output row. For each group:
  - `count: { $sum: 1 }` — add 1 for every document in the group → the question count.
  - `lastmod: { $max: "$updatedAt" }` — the largest (newest) updatedAt in the group →
    the paper's honest lastmod.
- Why aggregate at all? You *could* fetch every question to Node and count with a loop.
  With thousands of questions that ships megabytes over the wire. The pipeline counts
  **inside MongoDB** and ships only the small result. The real file's comment adds the
  second reason: this `$group` scans the whole collection and no index serves it — which
  is exactly why the result is cached (chunk 3).

### Chunk 2 — resolving names

```ts
  const [levels, subjects, records]: readonly unknown[][] = await Promise.all([
    LevelModel.find().lean(),
    SubjectModel.find().lean(),
    RecordModel.find().lean(),
  ]);
  const levelNames = new Map(
    (levels as { _id: unknown; name: string }[]).map((l) => [
      String(l._id),
      l.name,
    ]),
  );
```

- The aggregation grouped by **ids** (`levelId`), but URLs need **names** ("HSC"). Ids
  live on the questions; names live in the level/subject/record collections. So: fetch
  those three collections, build id→name `Map`s, and resolve names in the loop.
- `.lean()` — return **plain JavaScript objects** instead of full Mongoose documents.
  Mongoose documents carry change-tracking, methods, and validators — heavy. For
  read-only data, `lean()` skips all of it. Notice these rows are typed loosely
  (`readonly unknown[][]` with casts at each use site) — a deliberate choice in this
  Mongoose version, documented in the real file.
- The loop after this (read it in the file) does two things per grouped row: skip rows
  whose names cannot be resolved (`if (!level || !subject || !record) continue;` —
  a deleted subject must not break the whole endpoint), and **skip names containing `_`
  or `/`** — because the slug grammar is positional on `_`, a name with an underscore
  would silently shift every position and corrupt every URL built from it. Drop the row,
  keep the grammar safe.

### Chunk 3 — the Redis cache, fail-open

```ts
const FACETS_CACHE_KEY = "question-facets:v1";
const FACETS_CACHE_TTL_S = 3600;

    try {
      const cached = await redisClient.get(FACETS_CACHE_KEY);
      if (cached) {
        res
          .status(200)
          .json({ success: true, data: JSON.parse(cached) });
        return;
      }
    } catch {
      // fall through to a direct computation
    }

    const rows = await computeFacets();

    try {
      await redisClient.set(FACETS_CACHE_KEY, JSON.stringify(rows), {
        EX: FACETS_CACHE_TTL_S,
      });
    } catch {
      // Cache write failures are not the client's problem.
    }
```

**Line by line:**

- The expensive computation runs at most once per hour. `redisClient.get(key)` returns
  the cached JSON string or null; a hit answers immediately.
- `EX: 3600` — the **expiry** in seconds: Redis deletes the key after one hour. The next
  request recomputes. A TTL (time to live) is how you keep a cache from serving stale
  data forever.
- The version in the key (`:v1`) — if the row shape ever changes, bump the key to `:v2`
  and old cached entries are simply never read. Cache **invalidation** made boring.
- Both Redis operations sit in their own `try/catch` with empty catches. Redis down?
  Read fails → compute directly. Write fails → answer anyway, just uncached. The client
  never learns Redis exists — that is what "fail-open" means for a cache: it is an
  optimization, not a dependency.
- One more detail in `question-routes.ts`: `router.get("/facets", …)` is mounted
  **above** `router.get("/:id", …)`. Express matches top to bottom — mounted below, the
  URL `/facets` would be captured as an id. Route order is load-bearing.

---

## 23. How tsconfig.middleware.json enforces edge-safety

File: `client/tsconfig.middleware.json` — a small config that acts as a guard.

**The problem:** the edge middleware must stay free of browser/Vite things
(`import.meta.env`, axios, react-router). Nothing in the *running* code stops you from
adding an import that breaks this — the failure would only appear at deploy time, on
Vercel, far from the line you wrote.

**The mechanism:** a second TypeScript project that includes **only the edge-safe files**:

```jsonc
{
  // (shortened from the real file)
  "include": ["middleware.ts", "src/lib/seo/seo-config.ts", "src/lib/seo/seo-routes.ts", "…"],
  "types": []
}
```

- `"include"` — the exact list of files the edge loads: the middleware, the resolver, the
  serializer, the slug parser, the type registry. Nothing else. If `seo-routes.ts`
  imports a file not on this list's transitive set, compilation fails here.
- `"types": []` — the powerful line. Normally a Vite project loads `vite/client` types,
  which **declare** `import.meta.env` as valid everywhere. `types: []` loads **no global
  type packages** — so `import.meta.env` becomes "property does not exist" → a **compile
  error**. The rule "no `import.meta.env` in edge files" stops being a comment and
  becomes machine-enforced.
- The root `tsconfig.json` references this file (project references), so every `tsc -b`
  build compiles both projects.

**It was tested live.** During development we added one line, `import.meta.env.MODE`, to
`seo-config.ts`. The build failed with exactly the intended error. The line was removed;
the build passed. A rule you have watched *fail the build* is a rule you can trust —
that is the difference between a convention and an enforcement.

> **The trick to remember:** move rules out of comments and into the build. If a machine
> can catch the mistake, let it.

---

*Part 2 sources: `client/src/lib/seo/seo-config.ts`, `client/src/utils/board-slug.ts`,
`client/src/utils/questionTypes.ts`, `client/src/lib/seo/seo-routes.ts`,
`client/src/lib/seo/seo-head.ts`, `client/src/lib/seo/RouteSeo.tsx`,
`client/src/lib/seo/seo-serialize.ts`, `client/middleware.ts`, `client/index.html`,
`client/tsconfig.middleware.json`, `client/scripts/generate-sitemap.mjs`,
`server/src/controllers/question-controller.ts`, `server/src/routes/question-routes.ts`.*
