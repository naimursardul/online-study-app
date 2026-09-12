import { Skeleton } from "@/components/ui/skeleton";
import { client, getBoardQusetonDetails } from "@/utils/utils";
import type { IqDetails } from "@/types/types";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMasterData } from "@/lib/MasterData-context";
import { typesForSubject } from "@/utils/questionTypes";
import ApiErrorState from "@/components/shared/ApiErrorState";

// One facet row per (level, subject, type, institution, year) combination that
// actually has questions — the sitemap's data source, reused here so the
// sidebar only lists papers that exist.
type FacetRow = {
  level: string;
  subject: string;
  questionType: string;
  institution: string;
  year: string;
  count: number;
  lastmod: string;
};

export default function SingleQuestionBankSidebar({
  slug,
}: {
  slug: string | undefined;
}) {
  const [paperPairs, setPaperPairs] = useState<
    { institution: string; year: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  // A failed facets fetch used to render an empty sidebar — a paper page
  // with no way to reach any paper.
  const [loadError, setLoadError] = useState<unknown>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const { pathname } = useLocation();
  const { masterData } = useMasterData();

  const details: IqDetails = useMemo(
    () => getBoardQusetonDetails(masterData, slug ?? ""),
    [masterData, slug],
  );

  // One link per type the slug's subject offers, so a subject that only has
  // MCQ and SQ never advertises a CQ paper.
  const questionTypes = useMemo(() => {
    const subject = masterData.subjects.find(
      (s) => s._id === details?.withId?.subjectId,
    );
    return typesForSubject(subject?.questionTypes);
  }, [masterData, details]);

  useEffect(() => {
    async function getAllData() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await client.get(`/question/facets`);

        const { data } = res;

        if (data?.success) {
          // Only pairs for this slug's level + subject, deduped — each facet
          // row is per question type, but the sidebar lists the pair once.
          const level = details?.withName?.level;
          const subject = details?.withName?.subject;
          const seen = new Set<string>();
          const pairs: { institution: string; year: string }[] = [];
          for (const row of data.data as FacetRow[]) {
            if (row.level !== level || row.subject !== subject) continue;
            const key = `${row.institution}_${row.year}`;
            if (seen.has(key)) continue;
            seen.add(key);
            pairs.push({ institution: row.institution, year: row.year });
          }
          setPaperPairs(pairs);
        }
      } catch (error) {
        console.error(error);
        setLoadError(error);
      } finally {
        setLoading(false);
      }
    }

    getAllData();
  }, [reloadToken, details]);

  return (
    <div className="md:sticky top-1.25 md:min-w-47.5 md:max-h-[calc(100vh-15px)] bg-background rounded-lg px-4 py-5 border border-sidebar-border">
      <form action="" className="h-12.5 ">
        <input
          type="text"
          placeholder="Search"
          className="w-full h-8 text-sm border border-border rounded-lg outline-none px-3 "
        />
      </form>
      <div className="md:overflow-y-auto max-md:overflow-x-auto md:h-[calc(100vh-110px)] flex md:flex-col gap-2 text-[13px] max-md:text-xs  ">
        {loadError !== null ? (
          <ApiErrorState
            error={loadError}
            message="Failed to load the board list."
            onRetry={() => setReloadToken((t) => t + 1)}
          />
        ) : (!loading && Array.isArray(paperPairs)) ||
          (loading && Array.isArray(paperPairs) && paperPairs.length > 0) ? (
          paperPairs.map((d, i) => (
            <div key={i} className="flex md:flex-col gap-2">
              {questionTypes.map((type) => {
                const to = `/question-bank/${slug}/${type.code}_${d?.institution}_${d?.year}`;

                return (
                  <Link
                    key={type.code}
                    className={
                      to === pathname
                        ? "bg-muted px-3 py-2 rounded-lg border-none outline-none"
                        : "hover:bg-muted px-3 py-2 rounded-lg border-none outline-none "
                    }
                    to={to}
                  >
                    {`${d?.institution}-${d?.year} (${type.label})`}
                  </Link>
                );
              })}
            </div>
          ))
        ) : (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="w-full h-8" />
          ))
        )}
      </div>
    </div>
  );
}
