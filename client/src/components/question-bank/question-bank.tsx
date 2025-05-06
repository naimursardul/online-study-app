"use client";

import { IBackground, ILevel, ISubject } from "@/lib/type";
import React, { useEffect, useState } from "react";
import QbSection from "./qb-section";
import { Skeleton } from "../ui/skeleton";

export default function QuestionBank() {
  const [loading, setLoading] = useState<Record<string, boolean>>({
    level: false,
    bg: false,
    subject: false,
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
        setLoading({ ...loading, bg: false });
        return;
      } catch (error) {
        console.log(error);
        setLoading({ ...loading, bg: false });
      }
    }

    getAllBackground();
  }, []);

  useEffect(() => {
    async function getAllSubject() {
      setLoading({ ...loading, subject: true });

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/subject?level`
        );

        const data = await res.json();
        if (data?.success) {
          setAllSubject(data?.data);
        }
        setLoading({ ...loading, subject: false });
        return;
      } catch (error) {
        console.log(error);
        setLoading({ ...loading, subject: false });
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
        setLoading({ ...loading, level: false });
        return;
      } catch (error) {
        console.log(error);
        setLoading({ ...loading, level: false });
      }
    }

    getAllLevel();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {loading?.level || loading?.bg || loading?.subject
        ? [1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              className="space-y-3 bg-input rounded-2xl px-4 py-5"
            >
              <Skeleton className=" h-8 w-[200px] rounded-2xl" />
              <div className="flex gap-2">
                <Skeleton className=" h-8 w-[100px] rounded-xl" />
                <Skeleton className=" h-8 w-[100px] rounded-xl" />
                <Skeleton className=" h-8 w-[100px] rounded-xl" />
                <Skeleton className=" h-8 w-[100px] rounded-xl" />
                <Skeleton className=" h-8 w-[100px] rounded-xl" />
              </div>
              <div className="flex flex-wrap gap-4 ">
                <Skeleton className=" w-[140px] h-[140px] rounded-2xl" />
                <Skeleton className=" w-[140px] h-[140px] rounded-2xl" />
                <Skeleton className=" w-[140px] h-[140px] rounded-2xl" />
                <Skeleton className=" w-[140px] h-[140px] rounded-2xl" />
                <Skeleton className=" w-[140px] h-[140px] rounded-2xl" />
              </div>
            </Skeleton>
          ))
        : Array.isArray(allLevel) &&
          allLevel.length > 0 &&
          allLevel.map((level, i) => (
            <QbSection
              key={i}
              level={level}
              allBackground={allBackground}
              allSubject={allSubject}
            />
          ))}
    </div>
  );
}
