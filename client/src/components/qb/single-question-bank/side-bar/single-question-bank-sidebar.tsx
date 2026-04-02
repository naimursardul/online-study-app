import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/utils";
import type { IRecord } from "@/types/types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function SingleQuestionBankSidebar({
  slug,
}: {
  slug: string | undefined;
}) {
  const [allData, setAllData] = useState<(IRecord & { _id: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getAllData() {
      setLoading(true);
      try {
        const res = await client.get(`/record?recordType=Board`);

        const { data } = res;

        if (data?.success) {
          setAllData(data?.data);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }

    getAllData();
  }, []);

  console.log(slug);

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
        {(!loading && Array.isArray(allData)) ||
        (loading && Array.isArray(allData) && allData.length > 0)
          ? allData.map((d, i) => (
              <div key={i} className="flex md:flex-col gap-2">
                <Link
                  className={
                    `${slug}/MCQ_${d?.institution}_${d?.year}` === slug
                      ? "bg-muted px-3 py-2 rounded-lg border-none outline-none"
                      : "hover:bg-muted px-3 py-2 rounded-lg border-none outline-none "
                  }
                  to={`/question-bank/${slug}/MCQ_${d?.institution}_${d?.year}`}
                >
                  {`${d?.institution}-${d?.year} (MCQ)`}
                </Link>
                <Link
                  className={
                    `${slug}/CQ_${d?.institution}_${d?.year}` === slug
                      ? "bg-muted px-3 py-2 rounded-lg border-none outline-none"
                      : "hover:bg-muted px-3 py-2 rounded-lg border-none outline-none "
                  }
                  to={`/question-bank/${slug}/CQ_${d?.institution}_${d?.year}`}
                >
                  {`${d?.institution}-${d?.year} (CQ)`}
                </Link>
              </div>
            ))
          : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <Skeleton key={i} className="w-full h-8" />
            ))}
      </div>
    </div>
  );
}
