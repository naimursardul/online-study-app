import type {
  IBackground,
  ILevel,
  IPopulatedData,
  ISubject,
} from "@/types/types";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/card";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

type Props = {
  level: ILevel & { _id: string };
  allBackground: (IBackground & { _id: string })[];
  allSubject: (ISubject & { _id: string })[];
};

export default function QbSection({ level, allBackground, allSubject }: Props) {
  const [filter, setFilter] = useState<string[]>([]);

  // ✅ Filter backgrounds belonging to this level
  const backgrounds = useMemo(() => {
    return allBackground.filter((b) => {
      const levelId = b.level?._id;
      return levelId === level._id;
    });
  }, [allBackground, level._id]);

  // ✅ Filter subjects by level + selected backgrounds
  const subjects = useMemo(() => {
    return allSubject.filter((s) => {
      const subjectLevelId = s.level?._id;
      const subjectBackgrounds = s.background || [];

      // must match level
      if (subjectLevelId !== level._id) return false;

      // no filters selected → show all for level
      if (filter.length === 0) return true;

      // check if every selected background id exists in subject backgrounds
      const bgIds = new Set(subjectBackgrounds.map((bg) => bg._id));

      return filter.every((id) => bgIds.has(id));
    });
  }, [allSubject, filter, level._id]);

  return (
    <div className="space-y-3 bg-input rounded-2xl px-4 py-5">
      <h2 className="font-semibold pl-2">{level.name}</h2>

      {/* BACKGROUND FILTERS */}
      <ToggleGroup type="multiple" onValueChange={(value) => setFilter(value)}>
        {backgrounds.map((b) => (
          <ToggleGroupItem
            key={b._id}
            value={b._id}
            className="px-4 py-3 max-md:text-xs font-medium border bg-popover text-chart-2 cursor-pointer"
          >
            {b.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* SUBJECTS */}
      <div className="flex flex-wrap gap-4">
        {subjects.map((s) => (
          <Link
            key={s._id}
            to={`question-bank/${(s.level as IPopulatedData).name}_${s.name}`}
          >
            <Card className="bg-sidebar flex justify-center items-center text-sm font-semibold p-1 w-30 h-30 border cursor-pointer hover:opacity-70">
              {s.name}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
