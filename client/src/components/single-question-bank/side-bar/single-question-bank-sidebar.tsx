"use client";

import { IRecord } from "@/lib/type";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "../../ui/skeleton";

export default function SingleQuestionBankSidebar({
  slug,
}: {
  slug: string[];
}) {
  const [allData, setAllData] = useState<(IRecord & { _id: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getAllData() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/record?recordType=Board`
        );

        const data = await res.json();

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

  console.log(slug.join("_"));

  return (
    <div className="md:sticky top-[5px] md:min-w-[190px] md:max-h-[calc(100vh-15px)] bg-background rounded-lg px-4 py-5 border border-sidebar-border">
      <form action="" className="h-[50px] ">
        <input
          type="text"
          placeholder="Search"
          className="w-full h-[32px] text-sm border-1 border-border rounded-lg outline-none px-3 "
        />
      </form>
      <div className="md:overflow-y-auto max-md:overflow-x-auto md:h-[calc(100vh-110px)] flex md:flex-col gap-2 text-[13px] max-md:text-xs  ">
        {(!loading && Array.isArray(allData)) ||
        (loading && Array.isArray(allData) && allData.length > 0)
          ? allData.map((d, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Link
                  className={
                    `${slug[0]}/MCQ_${d?.institution}_${d?.year}` ===
                    slug.join("/")
                      ? "bg-muted px-3 py-2 rounded-lg border-none outline-none"
                      : "hover:bg-muted px-3 py-2 rounded-lg border-none outline-none "
                  }
                  href={`/question-bank/${slug[0]}/MCQ_${d?.institution}_${d?.year}`}
                >
                  {`${d?.institution}-${d?.year} (MCQ)`}
                </Link>
                <Link
                  className={
                    `${slug[0]}/CQ_${d?.institution}_${d?.year}` ===
                    slug.join("/")
                      ? "bg-muted px-3 py-2 rounded-lg border-none outline-none"
                      : "hover:bg-muted px-3 py-2 rounded-lg border-none outline-none "
                  }
                  href={`/question-bank/${slug[0]}/CQ_${d?.institution}_${d?.year}`}
                >
                  {`${d?.institution}-${d?.year} (CQ)`}
                </Link>
              </div>
            ))
          : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sk, i) => (
              <Skeleton key={i} className="w-full h-8"></Skeleton>
            ))}
      </div>
    </div>
  );
}
