import { Link } from "react-router-dom";
import SiteBrand from "./SiteBrand";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Question Bank", to: "/question-bank" },
      { label: "Question Explorer", to: "/question-explorer" },
      { label: "Mock Exams", to: "/exam" },
      { label: "Dashboard", to: "/dashboard" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      {/* pb-20 clears the fixed h-16 mobile tab bar in Navbar. */}
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-20 sm:pb-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <SiteBrand asLink={false} />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A question bank and mock exam tool for Bangladeshi board and
              admission preparation.
            </p>
            <a
              href="mailto:contact@poruya.com"
              className="mt-4 inline-block text-sm text-brand-text underline-offset-4 hover:underline"
            >
              contact@poruya.com
            </a>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="mb-4 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                {col.heading}
              </h2>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Poruya. All rights reserved.</p>
          <p>Early access — features are still being added.</p>
        </div>
      </div>
    </footer>
  );
}
