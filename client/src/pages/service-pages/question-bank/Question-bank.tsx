import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { extractIdTo_ } from "@/utils/utils";
import { useAuth } from "@/lib/Auth-context";
import { BookOpen, Layers } from "lucide-react";
import InstitutionSubject from "@/components/qb/Institution-subjects";
import { useMasterData } from "@/lib/MasterData-context";
import { Badge } from "@/components/ui/badge";
import { QbSecSkeleton } from "@/components/skeleton/QbSecSkeleton";

export default function QuestionBank() {
  const { user, userExisted } = useAuth();

  const { masterData, masterDataLoading } = useMasterData();

  // =========================================
  // Filtered Subjects
  // =========================================
  const userFilteredSubjects = useMemo(() => {
    return masterData.subjects?.filter((subject) => {
      const levelId = subject.levelId;
      const backgroundId = subject.backgroundId || [];

      return (
        levelId === user?.level._id &&
        backgroundId.some((bgId) => bgId === user?.background?._id)
      );
    });
  }, [masterData.subjects, user]);

  return (
    <div className="flex flex-col gap-9 mt-5 mb-16">
      <div className="space-y-10">
        {/* My Level */}
        {(user || userExisted) && (
          <>
            <section className="space-y-4">
              <h2 className="font-bold text-xl pl-4">My Level</h2>

              {user?.level?.name && userFilteredSubjects?.length ? (
                <Card className="px-5 py-6">
                  <CardTitle className="flex gap-5 justify-between mb-2">
                    <h2 className="flex gap-2 font-semibold pl-2">
                      <Layers size={"22px"} />
                      {user?.level.name}{" "}
                      <span className="bg-foreground text-background text-xs py-1 px-2 rounded-2xl">
                        {user?.background?.name}
                      </span>
                    </h2>
                    <Badge>
                      Subjects: {(userFilteredSubjects || []).length}
                    </Badge>
                  </CardTitle>

                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      {userFilteredSubjects.map((subject) => (
                        <Link
                          key={subject._id}
                          to={`${extractIdTo_(masterData?.levels, subject.levelId, "name")}_${subject.name}`}
                        >
                          <Card className="bg-input flex flex-col gap-1.5 justify-center items-center text-xs max-lg:text-[11px] font-semibold p-1 w-40 max-lg:w-27 h-25 max-lg:h-20 border cursor-pointer hover:scale-105 transition-transform">
                            <BookOpen size={20} /> {subject.name}
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <QbSecSkeleton />
              )}
            </section>
            <Separator className="bg-input" />
          </>
        )}

        {/* All Levels */}
        <section className="flex flex-col gap-4">
          <h2 className="font-bold text-xl pl-4">All Levels</h2>

          {masterDataLoading
            ? Array.from({ length: 4 }).map((_, i) => <QbSecSkeleton key={i} />)
            : masterData.levels?.map((level) => (
                <InstitutionSubject key={level._id} level={level} />
              ))}
        </section>
      </div>
    </div>
  );
}
