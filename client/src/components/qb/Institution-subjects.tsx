import type { IMasterData } from "@/types/types";
import { useMemo, useState } from "react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Layers } from "lucide-react";
import { useMasterData } from "@/lib/MasterData-context";
import { extractIdTo_ } from "@/utils/utils";
import { Badge } from "../ui/badge";
import Tile from "./Tile";
import { Input } from "../ui/input";

export default function InstitutionSubject({
  level,
}: {
  level: IMasterData["levels"][number];
}) {
  const [filter, setFilter] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");

  const { masterData } = useMasterData();

  // =========================================
  // Filter institutions belonging to this level
  // =========================================
  const institutions = useMemo(() => {
    return masterData.institutions?.filter((i) => {
      if (search.trim() !== "") {
        return (
          i.levelId === level._id &&
          i.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      return i.levelId === level._id;
    });
  }, [masterData.institutions, level._id, search]);

  // =========================================
  // Filter backgrounds belonging to this level
  // =========================================
  const backgrounds = useMemo(() => {
    return masterData.backgrounds?.filter((b) => {
      return b.levelId === level._id;
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
      <CardTitle className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground">
              <Layers className="size-5" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">{level.name}</h3>
          </div>
          <Badge variant="secondary">Subjects: {(subjects || []).length}</Badge>
        </div>
        {/* BACKGROUND FILTERS */}
        {(level?.name === "HSC" || level?.name === "SSC") && (
          <ToggleGroup
            type="multiple"
            spacing={2}
            className="flex-wrap gap-2"
            onValueChange={(value) => setFilter(value)}
          >
            {backgrounds.map((b) => (
              <ToggleGroupItem
                key={b._id}
                value={b._id}
                className="h-auto rounded-full border border-input px-3.5 py-1.5 text-xs max-md:text-[11px] font-medium text-muted-foreground cursor-pointer hover:border-primary/40 hover:text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary data-[state=on]:hover:bg-primary"
              >
                {extractIdTo_(masterData.backgrounds, b._id, "name")}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
        {level?.name === "JOB" && (
          <Input onChange={(e) => setSearch(e.target.value)} />
        )}
      </CardTitle>

      <CardContent>
        {/* SUBJECTS */}
        <div className="flex flex-wrap gap-4 max-lg:gap-2.5">
          {(level?.name === "HSC" || level?.name === "SSC") &&
            subjects.map((s) => (
              <Tile
                key={s._id}
                to={`${extractIdTo_(masterData.levels, s.levelId, "name")}_${s.name}`}
                name={s.name}
              />
            ))}
          {level?.name === "JOB" &&
            institutions.map((i) => (
              <Tile
                key={i._id}
                to={`${extractIdTo_(masterData.levels, i.levelId, "name")}_${i.name}`}
                name={i.name}
              />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
