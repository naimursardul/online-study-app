import { useMemo } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { extractIdTo_ } from "@/utils/utils";
import { useAuth } from "@/lib/Auth-context";
import { Layers } from "lucide-react";
import SubjectTile from "@/components/qb/Tile";
import InstitutionSubject from "@/components/qb/Institution-subjects";
import { useMasterData } from "@/lib/MasterData-context";
import { Badge } from "@/components/ui/badge";
import { QbSecSkeleton } from "@/components/skeleton/QbSecSkeleton";

const SECTION_LABEL =
  "text-sm font-semibold uppercase tracking-wide text-muted-foreground pl-1";

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
    <div className="flex flex-col gap-10 mt-5 mb-16">
      {/* Page header — the home page's SectionHeading pattern on shadcn tokens */}
      <header>
        <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
          Question Bank
        </p>
        <h1 className="text-2xl max-md:text-xl font-bold tracking-tight text-foreground">
          Board questions, by level
        </h1>
        <p className="mt-3 text-muted-foreground">
          Browse past board questions by level, background and subject.
        </p>
      </header>

      <div className="space-y-10">
        {/* My Level */}
        {(user || userExisted) && (
          <section className="space-y-4">
            <h2 className={SECTION_LABEL}>My Level</h2>

            {user?.level?.name && userFilteredSubjects?.length ? (
              <Card className="px-5 py-6">
                <CardTitle className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground">
                      <Layers className="size-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">
                      {user?.level.name}
                    </h3>
                    {user?.background?.name && (
                      <span className="bg-secondary text-secondary-foreground text-xs font-medium py-1 px-2.5 rounded-full">
                        {user?.background?.name}
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary">
                    Subjects: {(userFilteredSubjects || []).length}
                  </Badge>
                </CardTitle>

                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {userFilteredSubjects.map((subject) => (
                      <SubjectTile
                        key={subject._id}
                        to={`${extractIdTo_(masterData?.levels, subject.levelId, "name")}_${subject.name}`}
                        name={subject.name}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <QbSecSkeleton />
            )}
          </section>
        )}

        {/* All Levels */}
        <section className="flex flex-col gap-4">
          <h2 className={SECTION_LABEL}>All Levels</h2>

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
