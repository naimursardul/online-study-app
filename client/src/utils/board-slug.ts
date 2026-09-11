import type { BoardSlugParts } from "../types/types";

/*
 * The positional grammar of question-bank slugs:
 *   slug1 = "HSC_Physics-1st"                  → level, subject
 *   slug2 = "MCQ_Dhaka_2024"                   → questionType, institution, year
 * The two route params continue one grammar — level_subject_type_institution_year —
 * so slug2's parts sit at positions 2-4, not 0-2. Pass the start position.
 *
 * Extracted from getBoardQusetonDetails so the SEO resolver (which runs on the
 * Vercel edge and in the browser) can parse slugs without importing utils.ts —
 * that file creates an axios instance at module scope from import.meta.env,
 * neither of which exists at the edge. Keep this file dependency-free apart
 * from the type import.
 */
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
