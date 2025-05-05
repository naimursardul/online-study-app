"use client";

import { IBackground, ILevel, ISubject } from "@/lib/type";
import React, { useEffect, useState } from "react";
import QbSection from "./qb-section";

export default function QuestionBank() {
  // const [loading, setLoading] = useState<boolean>(false);
  const [allLevel, setAllLevel] = useState<(ILevel & { _id: string })[]>([]);
  const [allSubject, setAllSubject] = useState<(ISubject & { _id: string })[]>(
    []
  );
  const [allBackground, setAllBackground] = useState<
    (IBackground & { _id: string })[]
  >([]);

  useEffect(() => {
    async function getAllBackground() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/background?level`
        );

        const data = await res.json();
        if (data?.success) {
          setAllBackground(data?.data);
        }
      } catch (error) {
        console.log(error);
      }
    }

    getAllBackground();
  }, []);

  useEffect(() => {
    async function getAllSubject() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/subject?level`
        );

        const data = await res.json();
        if (data?.success) {
          setAllSubject(data?.data);
        }
      } catch (error) {
        console.log(error);
      }
    }

    getAllSubject();
  }, []);

  useEffect(() => {
    async function getAllLevel() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/level`
        );

        const data = await res.json();
        if (data?.success) {
          setAllLevel(data?.data);
        }
      } catch (error) {
        console.log(error);
      }
    }

    getAllLevel();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {Array.isArray(allLevel) &&
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
