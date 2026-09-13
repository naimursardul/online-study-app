/*
 * The single source of truth for per-route SEO metadata.
 *
 * resolveSeo(pathname) -> SeoHead is pure: it derives everything from the
 * pathname, the slug grammar and the question-type registry — never from
 * master data, axios, or react-router. The browser writer (RouteSeo.tsx) and
 * the edge middleware (client/middleware.ts) both call it, so the two cannot
 * disagree.
 *
 * EDGE-SAFE: this file is imported by client/middleware.ts. Only
 * dependency-free sibling modules are allowed here — see seo-config.ts.
 *
 * The table below mirrors the route list in App.tsx. When you add a route
 * there, add its entry here in the same commit — a route missing from this
 * table silently inherits the 404 metadata, and nothing detects that because
 * falling through is also what a genuine 404 does.
 */
import {
  absoluteUrl,
  buildTitle,
  clampDescription,
  type SeoHead,
} from "./seo-config";
import { parseSlug } from "../../utils/parse-slug";
import { isQuestionTypeCode, labelOf } from "../../utils/questionTypes";

// ---------------------------------------------------------------------------
// Local path matcher
//
// ~25 lines instead of react-router's matchPath, because the edge cannot
// import react-router. Supports only `:param` segments and a trailing `*`,
// which is all App.tsx uses. Matching is case-insensitive and tolerates a
// trailing slash, matching react-router's behaviour (App.tsx renders
// /QUESTION-BANK and /about/ today, and those must canonicalise, not 404).
// ---------------------------------------------------------------------------

interface MatchResult {
  params: Record<string, string>;
}

function matchPath(pattern: string, pathname: string): MatchResult | null {
  const pat = pattern.toLowerCase().replace(/\/+$/, "") || "/";
  const path = pathname.replace(/\/+$/, "") || "/";
  const patParts = pat.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  const params: Record<string, string> = {};

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
}

// ---------------------------------------------------------------------------
// Head builders
// ---------------------------------------------------------------------------

interface HeadOptions {
  title: string;
  description: string;
  /** Path for the canonical, substituted into the matched pattern. */
  canonicalPath: string | null;
  robots?: string;
  jsonLd?: object[];
  status?: 200 | 404;
  bare?: boolean;
}

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

/** noindex plus (optionally) nofollow — no canonical, ever. */
function noIndexHead(
  title: string,
  description: string,
  nofollow = false,
): SeoHead {
  return head({
    title,
    description,
    // A self-canonical on a private surface asserts "this URL is the preferred
    // version of a real page", which is false. noindex + no canonical is
    // unambiguous; noindex + a canonical elsewhere sends two contradictory
    // signals.
    canonicalPath: null,
    robots: nofollow ? "noindex, nofollow" : "noindex, follow",
  });
}

// ---------------------------------------------------------------------------
// Copy — reused from existing strings (index.html, HeroSection, SiteFooter,
// the Navbar service one-liners, the legal-page intros) rather than invented
// in a new voice.
// ---------------------------------------------------------------------------

const HOME_DESCRIPTION =
  "Past board and admission questions organised by subject, chapter and topic, plus timed MCQ mock exams that target your weak topics.";

const NOT_FOUND_DESCRIPTION =
  "This page does not exist. Browse the question bank to find past board and admission questions.";

// ---------------------------------------------------------------------------
// Question-bank resolvers — pure string work on the slug parts
// ---------------------------------------------------------------------------

const YEAR_RE = /^(19|20)\d{2}$/;

/**
 * slug1 = level_subject. Exactly two non-empty parts, or the URL is garbage:
 * /question-bank/HSC_Physics-1st_MCQ renders a working page today at a
 * near-duplicate URL, so anything malformed gets noindex + 404 rather than a
 * canonical.
 */
function questionBankSlug1(slug1: string): SeoHead {
  const { level, subject, institution } = parseSlug(slug1);
  const parts = slug1.split("_").filter(Boolean);
  let valid = false;
  if (level === "HSC" || level === "SSC") {
    valid = parts.length === 2 && Boolean(level) && Boolean(subject);
  } else {
    valid = parts.length === 2 && Boolean(level) && Boolean(institution);
  }
  if (!valid) {
    return head({
      title: "Page not found",
      description: NOT_FOUND_DESCRIPTION,
      canonicalPath: null,
      robots: "noindex, follow",
      status: 404,
    });
  }

  const title =
    level === "HSC" || level === "SSC"
      ? `${level} ${subject} board questions`
      : `${level} — ${institution} previous year questions`;
  const description =
    level === "HSC" || level === "SSC"
      ? `Every ${level} ${subject} board paper on Poruya — pick an institution and year from the sidebar to open the full paper, question by question.`
      : `Every ${level} — ${institution} previous year question paper on Poruya — pick a year from the sidebar to open the full paper, question by question.`;

  return head({
    title,
    description,
    canonicalPath: `/question-bank/${slug1}`,
    jsonLd: [breadcrumbJsonLd(slug1, null)],
  });
}

/**
 * slug2 = type_institution_year. Exactly three non-empty parts with a known
 * type code and a plausible year. A slug2 missing its year is worse than a
 * malformed slug1: the page's query skips empty values, so it would return
 * every question for that level+subject+type — a duplicate-content generator
 * indexable under arbitrarily many URLs.
 */
function questionBankSlug2(slug1: string, slug2: string): SeoHead {
  const { level, subject, questionType, institution, year } = parseSlug(
    slug1 + "_" + slug2,
  );
  // slug2 continues the grammar at position 2: type, institution, year.
  const parts = slug2.split("_").filter(Boolean);

  const valid =
    level === "HSC" || level === "SSC"
      ? parts.length === 3 &&
        isQuestionTypeCode(questionType) &&
        Boolean(institution) &&
        YEAR_RE.test(year ?? "")
      : parts.length === 2 && Boolean(questionType) && YEAR_RE.test(year ?? "");

  if (!valid) {
    return head({
      title: "Page not found",
      description: NOT_FOUND_DESCRIPTION,
      canonicalPath: null,
      robots: "noindex, follow",
      status: 404,
    });
  }

  const label = labelOf(questionType!);
  const title =
    level === "HSC" || level === "SSC"
      ? `${institution} ${year} ${label} — ${level} ${subject}`
      : `${level} — ${institution} ${year} ${label}`;
  const description =
    level === "HSC" || level === "SSC"
      ? `Every question from the ${institution} ${year} ${label} paper for ${level} ${subject}, question by question. Sign in to check your answers.`
      : `Every question from the  ${level} — ${institution} ${year}. Sign in to check your answers.`;

  return head({
    title,
    description,
    canonicalPath: `/question-bank/${slug1}/${slug2}`,
    jsonLd: [breadcrumbJsonLd(slug1, slug2)],
  });
}

/** BreadcrumbList built from the same slug parts as the title. */
function breadcrumbJsonLd(slug1: string, slug2: string | null): object {
  // slug1 and slug2 continue one grammar: level_subject + type_institution_year.
  const { level, subject } = parseSlug(slug1);
  const { questionType, institution, year } = slug2
    ? parseSlug(slug2, "questionType")
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

// Organization + WebSite entities, linked by @id, on / only. Entity-resolution
// signals for a young brand — no rich result, hence no fields that would
// claim one (no logo until og.png exists, no SearchAction: the app's only
// search input has no handler).
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

// ---------------------------------------------------------------------------
// The route table — keep in App.tsx order so it reads the same way.
// ---------------------------------------------------------------------------

type RouteEntry =
  | { pattern: string; head: SeoHead }
  | {
      pattern: string;
      resolve: (params: Record<string, string>) => SeoHead;
    };

const ROUTES: RouteEntry[] = [
  // Home
  {
    pattern: "/",
    head: head({
      title: "Poruya — Practise real board questions",
      description: HOME_DESCRIPTION,
      canonicalPath: "/",
      jsonLd: SITE_JSON_LD,
      bare: true,
    }),
  },
  // HomeLayout children
  {
    pattern: "/about",
    // noindex while the body is placeholder copy — flip to index in the same
    // commit that writes real content.
    head: noIndexHead(
      "About us",
      "A question bank and mock exam tool for Bangladeshi board and admission preparation.",
    ),
  },
  {
    pattern: "/contact",
    head: head({
      title: "Contact us",
      description:
        "Questions, feedback or account trouble? Email contact@poruya.com and we'll get back to you.",
      canonicalPath: "/contact",
    }),
  },
  {
    pattern: "/terms",
    head: head({
      title: "Terms & Conditions",
      description:
        "These terms cover your use of Poruya — our question bank, question explorer, mock exams and the rest of the website.",
      canonicalPath: "/terms",
    }),
  },
  {
    pattern: "/privacy",
    head: head({
      title: "Privacy Policy",
      description:
        "What Poruya collects, why, and what you can ask us to do about it — in plain language rather than legal boilerplate.",
      canonicalPath: "/privacy",
    }),
  },
  {
    pattern: "/signup",
    head: noIndexHead(
      "Create a free account",
      "Create a free Poruya account to save questions, track your weak topics and take timed mock exams.",
    ),
  },
  {
    pattern: "/login",
    // Self-canonical despite noindex: it still collapses ?utm_* and ?ref=
    // variants of the login page itself.
    head: head({
      title: "Log in",
      description: "Log in to Poruya to keep practising where you left off.",
      canonicalPath: "/login",
      robots: "noindex, follow",
    }),
  },
  {
    pattern: "/forgot-password",
    head: noIndexHead(
      "Reset your password",
      "Reset your Poruya password using the phone number on your account.",
    ),
  },

  // ServiceLayout children
  {
    pattern: "/question-bank",
    head: head({
      title: "Question Bank",
      description:
        "Browse practice questions and prepare efficiently. Past Bangladeshi board and admission papers organised by subject, chapter and topic.",
      canonicalPath: "/question-bank",
    }),
  },
  {
    pattern: "/question-bank/:slug1",
    resolve: (p) => questionBankSlug1(p.slug1!),
  },
  {
    pattern: "/question-bank/:slug1/:slug2",
    resolve: (p) => questionBankSlug2(p.slug1!, p.slug2!),
  },
  {
    pattern: "/question-explorer",
    // noindex for now: a real feature, but it renders nothing without auth.
    // Promote when it has anonymous-visible content.
    head: noIndexHead(
      "Question Explorer",
      "Filter questions by institution, year, chapter and topic.",
    ),
  },
  {
    pattern: "/exam",
    head: noIndexHead("Mock Exams", "Take exams and track your performance."),
  },
  {
    pattern: "/exam/:examId",
    head: noIndexHead(
      "Exam",
      "A timed Poruya mock exam. Your answers are saved while you work.",
      true,
    ),
  },
  {
    // Public but renders literally <div>Doubt</div> — a placeholder.
    pattern: "/doubt",
    head: noIndexHead(
      "Doubt",
      "Ask questions and clear your confusion. (Coming soon.)",
    ),
  },
  {
    pattern: "/dashboard",
    head: noIndexHead("Dashboard", "Your Poruya performance analytics.", true),
  },
  {
    pattern: "/collection",
    head: noIndexHead("Collections", "Your saved question collections.", true),
  },
  {
    pattern: "/collections/:id",
    head: noIndexHead(
      "Collection",
      "A collection of saved questions. Only its owner can see it.",
      true,
    ),
  },

  // Admin — one entry covers /admin and all nine children.
  {
    pattern: "/admin/*",
    head: noIndexHead(
      "Admin",
      "Poruya administration. Sign in with an admin account to continue.",
      true,
    ),
  },

  // The catch-all. App.tsx renders NotFound here; the edge sends a real 404.
  {
    pattern: "*",
    head: head({
      title: "Page not found",
      description: NOT_FOUND_DESCRIPTION,
      canonicalPath: null,
      robots: "noindex, follow",
      status: 404,
    }),
  },
];

/**
 * Resolve the head for a pathname. First match wins. Canonicals are built
 * from the matched pattern with the raw params substituted, never from
 * location.pathname — this is what makes case-insensitive matches,
 * trailing slashes and query strings collapse into one canonical URL.
 */
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
