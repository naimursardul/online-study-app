/*
 * Title: Question Explorer
 * Description: Filtered, paginated question browser. Level and background come
 *              from the signed-in user's profile; every other filter is mirrored
 *              into the URL so a view can be shared, reloaded or navigated back to.
 */

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { client } from "@/utils/utils";
import { useAuth } from "@/lib/Auth-context";
import { useMasterData } from "@/lib/MasterData-context";
import { useDebounce } from "@/hooks/use-debounce";
import ComboboxMulti from "@/components/comboboxMulti/ComboboxMulti";
import SingleMcqQuestion from "@/components/qb/institution-question/single-question/single-mcq-question";
import SingleCqQuestion from "@/components/qb/institution-question/single-question/single-cq-queston";
import { McqQuestionSkeleton } from "@/components/skeleton/McqQuestionSkeleton";
import { CqQuestionSkeleton } from "@/components/skeleton/CqQuestionSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type {
  ICQ,
  IExplorerFilters,
  IField,
  IMCQ,
  ViewModeType,
} from "@/types/types";

const PAGE_SIZE = 20;

const EMPTY_FILTERS: IExplorerFilters = {
  questionType: "",
  subjectId: "",
  institution: [],
  year: [],
  chapterId: [],
  topicId: [],
  difficulty: "",
  search: "",
};

// Radix forbids value="" on a SelectItem, so a sentinel stands in for "no
// filter" — same convention as SingleCollectionPage.
const ALL = "all";

type ExplorerQuestion = (IMCQ | ICQ) & { _id: string };

export default function QuestionExplorer() {
  const { user } = useAuth();
  const { masterData } = useMasterData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [questions, setQuestions] = useState<ExplorerQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  // Below `lg` the filters live in a sheet instead of on the page.
  const [filterOpen, setFilterOpen] = useState(false);

  // ── The URL is the single source of truth for every filter ──────
  const filters: IExplorerFilters = useMemo(
    () => ({
      questionType: (searchParams.get("questionType") ??
        "") as IExplorerFilters["questionType"],
      subjectId: searchParams.get("subjectId") ?? "",
      institution: searchParams.getAll("institution"),
      year: searchParams.getAll("year"),
      chapterId: searchParams.getAll("chapterId"),
      topicId: searchParams.getAll("topicId"),
      difficulty: (searchParams.get("difficulty") ??
        "") as IExplorerFilters["difficulty"],
      search: searchParams.get("search") ?? "",
    }),
    [searchParams],
  );
  const page = Number(searchParams.get("page")) || 1;
  const viewMode = (searchParams.get("viewMode") ?? "viewOnly") as ViewModeType;

  const levelId = user?.level?._id ?? "";
  const backgroundId = user?.background?._id ?? "";

  function writeUrl(
    next: IExplorerFilters,
    nextPage: number,
    nextViewMode: ViewModeType,
  ) {
    const params = new URLSearchParams();
    if (next.questionType) params.set("questionType", next.questionType);
    if (next.subjectId) params.set("subjectId", next.subjectId);
    (["institution", "year", "chapterId", "topicId"] as const).forEach((key) =>
      next[key].forEach((value) => params.append(key, value)),
    );
    if (next.difficulty) params.set("difficulty", next.difficulty);
    if (next.search) params.set("search", next.search);
    if (nextPage > 1) params.set("page", String(nextPage));
    if (nextViewMode !== "viewOnly") params.set("viewMode", nextViewMode);
    setSearchParams(params);
  }

  // ComboboxMulti writes through a setState-style updater; route it into the
  // URL instead of local state. Any filter change snaps back to page 1.
  const setFilters: React.Dispatch<React.SetStateAction<IExplorerFilters>> = (
    update,
  ) => {
    const next =
      typeof update === "function"
        ? (update as (prev: IExplorerFilters) => IExplorerFilters)(filters)
        : update;
    writeUrl(next, 1, viewMode);
  };

  // The search box keeps its own state so typing doesn't push a history entry
  // (or fire a request) per keystroke.
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    if (debouncedSearch === filters.search) return;
    writeUrl({ ...filters, search: debouncedSearch }, 1, viewMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Keep the box in sync when the URL changes from outside (back button, a
  // shared link, Clear Filters).
  useEffect(() => {
    setSearchInput((current) =>
      current === filters.search ? current : filters.search,
    );
  }, [filters.search]);

  // ── Option lists, all derived from the master-data cache ────────
  // Same predicate as Question-bank.tsx: subjects offered for this user's
  // level that include their background.
  const subjectOptions = useMemo(
    () =>
      masterData.subjects.filter(
        (subject) =>
          subject.levelId === levelId &&
          subject.backgroundId.includes(backgroundId),
      ),
    [masterData.subjects, levelId, backgroundId],
  );

  // institution and year narrow each other, so impossible pairs never show up.
  // ComboboxMulti keys off `_id`, and the API wants the literal string, so the
  // name doubles as the id here.
  const institutionOptions = useMemo(() => {
    const names = masterData.records
      .filter(
        (record) => !filters.year.length || filters.year.includes(record.year),
      )
      .map((record) => record.institution);
    return [...new Set(names)].sort().map((name) => ({ _id: name, name }));
  }, [masterData.records, filters.year]);

  const yearOptions = useMemo(() => {
    const years = masterData.records
      .filter(
        (record) =>
          !filters.institution.length ||
          filters.institution.includes(record.institution),
      )
      .map((record) => record.year);
    return [...new Set(years)]
      .sort()
      .reverse()
      .map((name) => ({ _id: name, name }));
  }, [masterData.records, filters.institution]);

  const chapterOptions = useMemo(
    () =>
      filters.subjectId
        ? masterData.chapters.filter(
            (chapter) => chapter.subjectId === filters.subjectId,
          )
        : [],
    [masterData.chapters, filters.subjectId],
  );

  // Before any chapter is picked, offer every topic in the subject.
  const topicOptions = useMemo(() => {
    if (!filters.subjectId) return [];
    if (filters.chapterId.length)
      return masterData.topics.filter((topic) =>
        filters.chapterId.includes(topic.chapterId),
      );
    return masterData.topics.filter(
      (topic) => topic.subjectId === filters.subjectId,
    );
  }, [masterData.topics, filters.subjectId, filters.chapterId]);

  const comboField = (
    name: keyof IExplorerFilters,
    label: string,
    optionData: IField["optionData"],
  ): IField => ({
    name,
    label,
    placeholder: label,
    inputType: "comboboxMulti",
    optionData,
  });

  // ── Fetch ───────────────────────────────────────────────────────
  const isReady = Boolean(levelId && filters.questionType && filters.subjectId);

  useEffect(() => {
    if (!isReady) {
      setQuestions([]);
      setTotal(0);
      setTotalPages(1);
      return;
    }

    const controller = new AbortController();

    async function fetchQuestions() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("questionType", filters.questionType);
        params.set("levelId", levelId);
        if (backgroundId) params.append("backgroundId", backgroundId);
        params.set("subjectId", filters.subjectId);
        (["chapterId", "topicId", "institution", "year"] as const).forEach(
          (key) => filters[key].forEach((v) => params.append(key, v)),
        );
        if (filters.difficulty) params.set("difficulty", filters.difficulty);
        if (filters.search) params.set("search", filters.search);
        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));

        const res = await client.get(`/question?${params.toString()}`, {
          signal: controller.signal,
        });

        if (res.data.success) {
          setQuestions(res.data.data ?? []);
          setTotal(res.data.pagination?.total ?? 0);
          setTotalPages(res.data.pagination?.totalPages || 1);
        } else {
          toast.error(res.data.message ?? "Failed to load questions.");
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        toast.error("Failed to load questions.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    fetchQuestions();
    return () => controller.abort();
    // `filters` and `page` are both derived from searchParams.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, searchParams, levelId, backgroundId]);

  // ── Handlers ────────────────────────────────────────────────────
  function handleQuestionTypeChange(value: string) {
    writeUrl(
      {
        ...filters,
        questionType:
          value === ALL ? "" : (value as IExplorerFilters["questionType"]),
      },
      1,
      viewMode,
    );
  }

  function handleSubjectChange(value: string) {
    writeUrl(
      {
        ...filters,
        subjectId: value === ALL ? "" : value,
        chapterId: [],
        topicId: [],
      },
      1,
      viewMode,
    );
  }

  function handleDifficultyChange(value: string) {
    writeUrl(
      {
        ...filters,
        difficulty:
          value === ALL ? "" : (value as IExplorerFilters["difficulty"]),
      },
      1,
      viewMode,
    );
  }

  function handleClearFilters() {
    setSearchInput("");
    writeUrl(EMPTY_FILTERS, 1, viewMode);
  }

  const hasFilters =
    Boolean(filters.questionType) ||
    Boolean(filters.subjectId) ||
    Boolean(filters.difficulty) ||
    Boolean(filters.search) ||
    filters.institution.length > 0 ||
    filters.year.length > 0 ||
    filters.chapterId.length > 0 ||
    filters.topicId.length > 0;

  // Shown on the collapsed Filter button so the count is visible without
  // opening the sheet. Each selected item in a multi-select counts once.
  const activeFilterCount =
    [filters.questionType, filters.subjectId, filters.difficulty, filters.search]
      .filter(Boolean).length +
    filters.institution.length +
    filters.year.length +
    filters.chapterId.length +
    filters.topicId.length;

  const questionNo = (index: number) => (page - 1) * PAGE_SIZE + index + 1;

  // One element tree rendered in two places: inline from `lg` up, and inside the
  // filter sheet below that. Deliberately a variable and not a nested component —
  // a component declared here would be a new type on every render and would
  // remount the search box, dropping focus on each keystroke.
  const filterFields = (
    <>
      <Select
        value={filters.questionType || ALL}
        onValueChange={handleQuestionTypeChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Question type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Select question type</SelectItem>
          <SelectItem value="MCQ">MCQ</SelectItem>
          <SelectItem value="CQ">CQ</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.subjectId || ALL}
        onValueChange={handleSubjectChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Select subject</SelectItem>
          {subjectOptions.map((subject) => (
            <SelectItem key={subject._id} value={subject._id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ComboboxMulti<IExplorerFilters>
        field={comboField("institution", "Institution", institutionOptions)}
        formData={filters}
        setFormData={setFilters}
      />

      <ComboboxMulti<IExplorerFilters>
        field={comboField("year", "Year", yearOptions)}
        formData={filters}
        setFormData={setFilters}
      />

      <ComboboxMulti<IExplorerFilters>
        field={comboField("chapterId", "Chapter", chapterOptions)}
        formData={filters}
        setFormData={setFilters}
      />

      <ComboboxMulti<IExplorerFilters>
        field={comboField("topicId", "Topic", topicOptions)}
        formData={filters}
        setFormData={setFilters}
      />

      <Select
        value={filters.difficulty || ALL}
        onValueChange={handleDifficultyChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Any difficulty</SelectItem>
          <SelectItem value="Easy">Easy</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Hard">Hard</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={viewMode}
        onValueChange={(value) => writeUrl(filters, page, value as ViewModeType)}
        disabled={filters.questionType === "CQ"}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="View mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="viewOnly">View only</SelectItem>
          <SelectItem value="showAns">Show answer</SelectItem>
        </SelectContent>
      </Select>

      <Input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search question text…"
        className="w-full"
      />
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar — a card so it stays legible on the page background in both
          themes. */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Your profile:</span>
          <Badge variant="secondary">{user?.level?.name ?? "No level"}</Badge>
          <Badge variant="secondary">
            {user?.background?.name ?? "No background"}
          </Badge>
        </div>

        {/* lg and up: every control inline */}
        <div className="hidden gap-3 lg:grid lg:grid-cols-4">{filterFields}</div>

        {/* below lg: one button, controls in a bottom sheet */}
        <div className="lg:hidden">
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4" />
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary">{activeFilterCount}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  {user?.level?.name ?? "No level"} ·{" "}
                  {user?.background?.name ?? "No background"}
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-3 px-4 sm:grid-cols-2">
                {filterFields}
              </div>
              <SheetFooter className="flex-row gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => setFilterOpen(false)}
                >
                  {isReady ? `Show ${total}` : "Done"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {isReady
              ? `${total} question${total === 1 ? "" : "s"} found`
              : "Pick a question type and a subject to start."}
          </span>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Questions */}
      {!isReady ? (
        <div className="py-16 text-center text-muted-foreground">
          Choose a question type and a subject, then narrow down by institution,
          year, chapter, topic or difficulty.
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) =>
            filters.questionType === "CQ" ? (
              <CqQuestionSkeleton key={i} />
            ) : (
              <McqQuestionSkeleton key={i} />
            ),
          )}
        </div>
      ) : questions.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          No questions matched these filters. Try loosening one.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {questions.map((q, i) =>
            q.questionType === "CQ" ? (
              <SingleCqQuestion
                key={q._id}
                q={q as ICQ & { _id: string }}
                i={questionNo(i)}
              />
            ) : (
              <SingleMcqQuestion
                key={q._id}
                q={q as IMCQ & { _id: string }}
                i={questionNo(i)}
                viewMode={viewMode}
              />
            ),
          )}
        </div>
      )}

      {/* Pagination */}
      {isReady && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => writeUrl(filters, Math.max(1, page - 1), viewMode)}
            disabled={page === 1}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              writeUrl(filters, Math.min(totalPages, page + 1), viewMode)
            }
            disabled={page === totalPages}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      )}
    </div>
  );
}






