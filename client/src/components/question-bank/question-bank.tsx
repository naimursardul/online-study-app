"use client";

import { IBackground, ILevel, IPopulatedData, ISubject } from "@/lib/type";
import React, { useEffect, useState } from "react";
import QbSection from "./qb-section";
import { Skeleton } from "../ui/skeleton";
import { Card } from "../ui/card";
import Link from "next/link";
import { Separator } from "../ui/separator";

export default function QuestionBank() {
  const [loading, setLoading] = useState<Record<string, boolean>>({
    level: true,
    bg: true,
    subject: true,
  });
  const [allLevel, setAllLevel] = useState<(ILevel & { _id: string })[]>([]);
  const [allSubject, setAllSubject] = useState<(ISubject & { _id: string })[]>(
    []
  );
  const [allBackground, setAllBackground] = useState<
    (IBackground & { _id: string })[]
  >([]);

  useEffect(() => {
    async function getAllBackground() {
      setLoading({ ...loading, bg: true });
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/background?level`
        );

        const data = await res.json();
        if (data?.success) {
          setAllBackground(data?.data);
        }
        setLoading((prev) => {
          return { ...prev, bg: false };
        });
        return;
      } catch (error) {
        console.log(error);
        setLoading((prev) => {
          return { ...prev, bg: false };
        });
      }
    }

    getAllBackground();
  }, []);

  useEffect(() => {
    async function getAllSubject() {
      setLoading({ ...loading, subject: true });

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/subject`
        );

        const data = await res.json();
        if (data?.success) {
          setAllSubject(data?.data);
        }
        setLoading((prev) => {
          return { ...prev, subject: false };
        });
        return;
      } catch (error) {
        console.log(error);
        setLoading((prev) => {
          return { ...prev, subject: false };
        });
      }
    }

    getAllSubject();
  }, []);

  useEffect(() => {
    async function getAllLevel() {
      setLoading({ ...loading, level: true });

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/level`
        );

        const data = await res.json();
        if (data?.success) {
          setAllLevel(data?.data);
        }
        setLoading((prev) => {
          return { ...prev, level: false };
        });
        return;
      } catch (error) {
        console.log(error);
        setLoading((prev) => {
          return { ...prev, level: false };
        });
      }
    }

    getAllLevel();
  }, []);

  const user = {
    level: { _id: "680772ec513217f665959afb", name: "HSC" },
    background: { _id: "680932af513217f665959cc2", name: "Science" },
  };

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h2 className="font-bold text-xl pl-4">My Level</h2>
        {!loading?.level && !loading?.bg && !loading?.subject ? (
          <div className="space-y-3 bg-input rounded-2xl px-4 py-5">
            <h2 className="font-semibold pl-2 ">{`${user?.level?.name} (${user?.background?.name})`}</h2>

            <div className="flex flex-wrap gap-4">
              {Array.isArray(allSubject) &&
                allSubject.map((s, i) => {
                  const s_lid = (s?.level as unknown as IPopulatedData)?._id;
                  const s_b = s?.background as unknown as IPopulatedData[];
                  if (
                    user?.level?._id === s_lid &&
                    s_b.some((b) => b?._id === user?.background?._id)
                  ) {
                    return (
                      <Link key={i} href={`question-bank/HSC_Physics-1st`}>
                        <Card className="bg-sidebar flex justify-center items-center text-sm font-semibold p-1 w-[120px] h-[120px] border cursor-pointer hover:opacity-70">
                          {s?.name}
                        </Card>
                      </Link>
                    );
                  }
                })}
            </div>
          </div>
        ) : (
          <QbSecSkeleton />
        )}
      </div>
      <Separator className="bg-input" />
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-xl pl-4">All Levels</h2>
        {!loading?.level && !loading?.bg && !loading?.subject
          ? Array.isArray(allLevel) &&
            allLevel.length > 0 &&
            allLevel.map((level, i) => (
              <QbSection
                key={i}
                level={level}
                allBackground={allBackground}
                allSubject={allSubject}
              />
            ))
          : [1, 2, 3, 4].map((i) => <QbSecSkeleton key={i} />)}
      </div>
    </div>
  );
}

export function QbSecSkeleton() {
  return (
    <Skeleton className="space-y-3 bg-input rounded-2xl px-4 py-5">
      <Skeleton className=" h-8 w-[200px] rounded-2xl" />
      <div className="flex gap-2">
        <Skeleton className=" h-8 w-[100px] rounded-xl" />
        <Skeleton className=" h-8 w-[100px] rounded-xl" />
        <Skeleton className=" h-8 w-[100px] rounded-xl" />
        <Skeleton className=" h-8 w-[100px] rounded-xl" />
        <Skeleton className=" h-8 w-[100px] rounded-xl" />
      </div>
      <div className="flex flex-wrap gap-4 ">
        <Skeleton className=" w-[120px] h-[120px] rounded-2xl" />
        <Skeleton className=" w-[120px] h-[120px] rounded-2xl" />
        <Skeleton className=" w-[120px] h-[120px] rounded-2xl" />
        <Skeleton className=" w-[120px] h-[120px] rounded-2xl" />
        <Skeleton className=" w-[120px] h-[120px] rounded-2xl" />
      </div>
    </Skeleton>
  );
}
