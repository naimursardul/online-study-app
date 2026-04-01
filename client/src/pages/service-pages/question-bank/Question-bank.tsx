import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import QbSection from "@/components/qb/qb-section";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/utils";

import type {
  IBackground,
  ILevel,
  IPopulatedData,
  ISubject,
} from "@/types/types";
import { useAuth } from "@/lib/Auth-context";

type LoadingState = {
  level: boolean;
  bg: boolean;
  subject: boolean;
};

export default function QuestionBank() {
  const { user, userExisted } = useAuth();

  const [loading, setLoading] = useState<LoadingState>({
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
    const fetchData = async () => {
      try {
        const [bgRes, subjectRes, levelRes] = await Promise.all([
          client.get("/background?level"),
          client.get("/subject"),
          client.get("/level"),
        ]);

        if (bgRes.data?.success) {
          setAllBackground(bgRes.data.data);
        }

        if (subjectRes.data?.success) {
          setAllSubject(subjectRes.data.data);
        }

        if (levelRes.data?.success) {
          setAllLevel(levelRes.data.data);
        }
      } catch (error) {
        console.error("Failed to load question bank data:", error);
      } finally {
        setLoading({
          level: false,
          bg: false,
          subject: false,
        });
      }
    };

    fetchData();
  }, []);

  const userFilteredSubjects = useMemo(() => {
    return allSubject.filter((subject) => {
      const levelId = (subject.level as IPopulatedData)?._id;
      const backgrounds = (subject.background as IPopulatedData[]) || [];

      return (
        levelId === user?.level._id &&
        backgrounds.some((bg) => bg._id === user?.background._id)
      );
    });
  }, [allSubject]);

  const isLoading = loading.level || loading.bg || loading.subject;

  return (
    <div className="flex flex-col gap-9 mt-5 mb-16">
      <div className="space-y-10">
        {/* My Level */}
        {(user || userExisted) && (
          <>
            <section className="space-y-4">
              <h2 className="font-bold text-xl pl-4">My Level</h2>

              {!userFilteredSubjects[0] ? (
                <QbSecSkeleton />
              ) : (
                <div className="space-y-3 bg-input rounded-2xl px-4 py-5">
                  <h2 className="font-semibold pl-2">
                    {user?.level.name} ({user?.background.name})
                  </h2>

                  <div className="flex flex-wrap gap-4">
                    {userFilteredSubjects.map((subject) => (
                      <Link
                        key={subject._id}
                        to={`question-bank/${subject.name}`}
                      >
                        <Card className="bg-sidebar flex justify-center items-center text-sm font-semibold p-1 w-30 h-30 border cursor-pointer hover:opacity-70 transition-opacity">
                          {subject.name}
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
            <Separator className="bg-input" />
          </>
        )}

        {/* All Levels */}
        <section className="flex flex-col gap-4">
          <h2 className="font-bold text-xl pl-4">All Levels</h2>

          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <QbSecSkeleton key={i} />)
            : allLevel.map((level) => (
                <QbSection
                  key={level._id}
                  level={level}
                  allBackground={allBackground}
                  allSubject={allSubject}
                />
              ))}
        </section>
      </div>
    </div>
  );
}

export function QbSecSkeleton() {
  return (
    <div className="space-y-3 bg-input rounded-2xl px-4 py-5">
      <Skeleton className="h-8 w-50 rounded-2xl" />

      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-25 rounded-xl" />
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-30 h-30 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
