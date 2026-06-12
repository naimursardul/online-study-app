import type { IMasterData } from "@/types/types";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "../ui/card";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { BookOpen, Layers } from "lucide-react";
import { useMasterData } from "@/lib/MasterData-context";
import { extractIdTo_ } from "@/utils/utils";
import { Badge } from "../ui/badge";

export default function InstitutionSubject({
  level,
}: {
  level: IMasterData["levels"][number];
}) {
  const [filter, setFilter] = useState<string[]>([]);

  const { masterData } = useMasterData();

  // =========================================
  // Filter backgrounds belonging to this level
  // =========================================
  const backgrounds = useMemo(() => {
    return masterData.backgrounds?.filter((b) => {
      const levelId = b.levelId;
      return levelId === level._id;
    });
  }, [masterData.backgrounds, level._id]);

  // =========================================
  // Filter subjects by level + selected backgrounds
  // =========================================
  const subjects = useMemo(() => {
    return masterData.subjects?.filter((s) => {
      const subjectLevelId = s.levelId;
      const subjectBackgroundId = s.backgroundId || [];

      // must match level
      if (subjectLevelId !== level._id) return false;

      // no filters selected → show all for level
      if (filter.length === 0) return true;

      // check if every selected background id exists in subject backgrounds
      const bgIds = new Set(subjectBackgroundId);

      return filter.every((id) => bgIds.has(id));
    });
  }, [masterData.subjects, filter, level._id]);

  return (
    <Card className="px-5 py-6">
      <CardTitle className="flex justify-between gap-5">
        <div className="flex gap-2">
          <Layers size={"22px"} />
          <h2 className="font-bold ">{level.name}</h2>
        </div>
        <Badge>Subjects: {(subjects || []).length}</Badge>
      </CardTitle>

      {/* BACKGROUND FILTERS */}
      <ToggleGroup type="multiple" onValueChange={(value) => setFilter(value)}>
        {backgrounds.map((b) => (
          <ToggleGroupItem
            key={b._id}
            value={b._id}
            className="px-4 py-3 max-md:text-xs font-medium border bg-popover text-chart-2 cursor-pointer"
          >
            {extractIdTo_(masterData.backgrounds, b._id, "name")}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <CardContent>
        {/* SUBJECTS */}
        <div className="flex flex-wrap gap-4">
          {subjects.map((s) => (
            <Link
              key={s._id}
              to={`${extractIdTo_(masterData.levels, s.levelId, "name")}_${s.name}`}
            >
              <Card className="bg-input flex flex-col gap-1.5 justify-center items-center text-xs font-semibold p-1 w-40 h-25 border cursor-pointer hover:scale-105 transition-transform">
                <BookOpen size="20" /> {s.name}
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
