import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/Auth-context";
import { useMasterData } from "@/lib/MasterData-context";
import { client, cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ExamDifficultyType,
  ExamGenResType,
  ExamModeType,
} from "@/types/types";

type Props = {
  onGenerated: (data: ExamGenResType) => void;
};

const DIFFICULTIES: ExamDifficultyType[] = ["Easy", "Medium", "Hard", "Mix"];

export default function ExamBuilderForm({ onGenerated }: Props) {
  const { user } = useAuth();
  const { masterData } = useMasterData();

  const [examName, setExamName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [checkedChapters, setCheckedChapters] = useState<string[]>([]);
  const [topicsByChapter, setTopicsByChapter] = useState<
    Record<string, string[]>
  >({});
  const [difficulty, setDifficulty] = useState<ExamDifficultyType>("Mix");
  const [mode, setMode] = useState<ExamModeType>("random");
  const [size, setSize] = useState<number>(10);
  const [loading, setLoading] = useState(false);

  // Subjects scoped to the user's level + background
  const subjects = useMemo(() => {
    if (!user) return [];
    return masterData.subjects.filter(
      (s) =>
        String(s.levelId) === String(user.level?._id) &&
        s.backgroundId?.includes(String(user.background?._id)),
    );
  }, [masterData.subjects, user]);
  const chapters = useMemo(
    () => masterData.chapters.filter((c) => c.subjectId === subjectId),
    [masterData.chapters, subjectId],
  );

  const topicsOf = (chapterId: string) =>
    masterData.topics.filter((t) => t.chapterId === chapterId);

  // Reset dependents when subject changes
  function handleSubjectChange(value: string) {
    setSubjectId(value);
    setCheckedChapters([]);
    setTopicsByChapter({});
  }

  function toggleChapter(chapterId: string, checked: boolean) {
    setCheckedChapters((prev) =>
      checked ? [...prev, chapterId] : prev.filter((c) => c !== chapterId),
    );
    if (!checked) {
      setTopicsByChapter((prev) => {
        const next = { ...prev };
        delete next[chapterId];
        return next;
      });
    }
  }

  function toggleTopic(chapterId: string, topicId: string) {
    setTopicsByChapter((prev) => {
      const current = prev[chapterId] || [];
      const next = current.includes(topicId)
        ? current.filter((t) => t !== topicId)
        : [...current, topicId];
      return { ...prev, [chapterId]: next };
    });
  }

  // Resolve final topicIds: checked chapter w/o explicit topics ⇒ all its topics
  function resolveTopicIds(): string[] {
    if (!checkedChapters.length) return [];
    const ids: string[] = [];
    checkedChapters.forEach((ch) => {
      const explicit = topicsByChapter[ch] || [];
      if (explicit.length) {
        ids.push(...explicit);
      } else {
        ids.push(...topicsOf(ch).map((t) => t._id));
      }
    });
    return [...new Set(ids)];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!examName.trim()) return toast.error("Please enter an exam name.");
    if (!subjectId) return toast.error("Please select a subject.");
    if (!size || size < 1 || size > 100)
      return toast.error("Exam size must be between 1 and 100.");

    setLoading(true);
    try {
      const res = await client.post("/exam/generate", {
        examCategory: "personal",
        examName: examName.trim(),
        subjectId,
        topicIds: resolveTopicIds(),
        difficulty,
        mode,
        size,
      });

      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to generate exam.");
        return;
      }
      onGenerated(res.data.data as ExamGenResType);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to generate exam.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* EXAM NAME */}
      <div className="space-y-1.5">
        <Label htmlFor="examName">Exam name</Label>
        <Input
          id="examName"
          value={examName}
          placeholder="e.g. Physics weekly test 1"
          onChange={(e) => setExamName(e.target.value)}
        />
      </div>

      {/* SUBJECT */}
      <div className="space-y-1.5">
        <Label>Subject</Label>
        <Select value={subjectId} onValueChange={handleSubjectChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* CHAPTERS + TOPICS */}
      {subjectId && (
        <div className="space-y-2">
          <Label>
            Chapters{" "}
            <span className="text-muted-foreground text-xs font-normal">
              (leave all unchecked for the whole subject)
            </span>
          </Label>
          {chapters.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No chapters for this subject.
            </p>
          )}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {chapters.map((ch) => {
              const checked = checkedChapters.includes(ch._id);
              const selectedTopics = topicsByChapter[ch._id] || [];
              const chTopics = topicsOf(ch._id);
              return (
                <div
                  key={ch._id}
                  className="rounded-lg border border-sidebar-border p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`ch-${ch._id}`}
                      checked={checked}
                      onCheckedChange={(v) => toggleChapter(ch._id, Boolean(v))}
                    />
                    <Label
                      htmlFor={`ch-${ch._id}`}
                      className="cursor-pointer font-normal"
                    >
                      {ch.name}
                    </Label>
                  </div>

                  {/* Per-chapter topic multi-select */}
                  {checked && chTopics.length > 0 && (
                    <div className="mt-2 pl-6">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            className="w-full h-auto min-h-9 justify-between px-3 py-1.5 font-normal text-sm"
                          >
                            <span className="flex flex-wrap gap-1 flex-1 min-w-0">
                              {selectedTopics.length ? (
                                selectedTopics.map((tid) => {
                                  const t = chTopics.find((x) => x._id === tid);
                                  return (
                                    <Badge
                                      key={tid}
                                      variant="secondary"
                                      className="text-xs font-normal"
                                    >
                                      {t?.name}
                                    </Badge>
                                  );
                                })
                              ) : (
                                <span className="text-muted-foreground">
                                  All topics
                                </span>
                              )}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-(--radix-popover-trigger-width) p-0"
                          align="start"
                        >
                          <Command>
                            <CommandInput
                              placeholder="Search topics…"
                              className="h-9 text-sm"
                            />
                            <CommandList>
                              <CommandEmpty className="py-3 text-center text-sm text-muted-foreground">
                                No topics found.
                              </CommandEmpty>
                              <CommandGroup>
                                {chTopics.map((t) => {
                                  const isSelected = selectedTopics.includes(
                                    t._id,
                                  );
                                  return (
                                    <CommandItem
                                      key={t._id}
                                      value={t.name}
                                      onSelect={() =>
                                        toggleTopic(ch._id, t._id)
                                      }
                                      className="cursor-pointer text-sm"
                                    >
                                      <div
                                        className={cn(
                                          "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary transition-colors",
                                          isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "opacity-50",
                                        )}
                                      >
                                        {isSelected && (
                                          <Check className="h-3 w-3" />
                                        )}
                                      </div>
                                      {t.name}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DIFFICULTY + MODE */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Difficulty</Label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as ExamDifficultyType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Mode</Label>
          <Select
            value={mode}
            onValueChange={(v) => setMode(v as ExamModeType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="random">Random</SelectItem>
              <SelectItem value="weak">Weak-topic focused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SIZE */}
      <div className="space-y-1.5">
        <Label htmlFor="size">Number of questions</Label>
        <Input
          id="size"
          type="number"
          min={1}
          max={100}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        Generate exam
      </Button>
    </form>
  );
}
