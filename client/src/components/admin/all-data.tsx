import {
  ArchiveX,
  Edit,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  FilterX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, useRef, useMemo } from "react";
import type {
  IBackground,
  IChapter,
  IField,
  ILevel,
  IQueryFormData,
  IRecord,
  ISubject,
  ITopic,
} from "@/types/types";
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import UploadForm from "./upload-form";
import { client, createFormInfo, getQuestionDataOption } from "@/utils/utils";
import { useMasterData } from "@/lib/MasterData-context";
import DataField from "./data-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "../ui/card";

const PAGE_SIZE = 10;
type DataType = (
  | ILevel
  | IBackground
  | ISubject
  | IChapter
  | ITopic
  | IRecord
) & {
  _id: string;
};

// Routes whose DELETE cascades, and therefore expose GET /:id/impact. Records carry
// no taxonomy ids, so deleting one only unlinks it from questions and there is
// nothing to preview.
const IMPACT_ROUTES = ["/level", "/background", "/subject", "/chapter", "/topic"];

type ImpactReport = {
  kind: string;
  name: string;
  descendants: {
    backgrounds: number;
    subjects: number;
    chapters: number;
    topics: number;
  };
  questions: number;
  cqViaSubQuestions: number;
  savedQuestions: number;
  generatedExams: { pruned: number; deleted: number };
  affectedUsers: number;
  detached: {
    subjects: number;
    chapters: number;
    topics: number;
    questions: number;
  };
  preserved: {
    submittedExams: number;
    answerScripts: number;
    analyticsRows: number;
  };
};

// Declared at module level on purpose: nested inside AllData it would be a new
// component type on every render, remounting the dialog and losing its state.
function DeleteRowDialog({
  heading,
  route,
  id,
  name,
  onConfirm,
}: {
  heading: string;
  route: string;
  id: string;
  name: string;
  onConfirm: (id: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [impact, setImpact] = useState<ImpactReport | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasImpactEndpoint = IMPACT_ROUTES.includes(route);

  // Fetched on open rather than with the table: one request per row up front would
  // be six aggregate walks for a page nobody may delete from.
  useEffect(() => {
    if (!open || !hasImpactEndpoint) return;

    let cancelled = false;
    setLoadingImpact(true);
    setImpact(null);

    client
      .get(`${route}/${id}/impact`)
      .then((res) => {
        if (cancelled) return;
        if (res.data.success) setImpact(res.data.data);
        else toast.error(res.data.message || "Failed to load delete impact.");
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        toast.error("Failed to load delete impact.");
      })
      .finally(() => {
        if (!cancelled) setLoadingImpact(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, hasImpactEndpoint, route, id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      // Stays open on failure so the error toast has something to point at.
      if (await onConfirm(id)) setOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  const removed: string[] = [];
  if (impact) {
    const d = impact.descendants;
    if (d.backgrounds) removed.push(`${d.backgrounds} background(s)`);
    if (d.subjects) removed.push(`${d.subjects} subject(s)`);
    if (d.chapters) removed.push(`${d.chapters} chapter(s)`);
    if (d.topics) removed.push(`${d.topics} topic(s)`);
    if (impact.questions)
      removed.push(
        impact.cqViaSubQuestions
          ? `${impact.questions} question(s), incl. ${impact.cqViaSubQuestions} CQ(s) matched through a sub-question`
          : `${impact.questions} question(s)`,
      );
    if (impact.savedQuestions)
      removed.push(`${impact.savedQuestions} saved question(s)`);
    if (impact.generatedExams.deleted)
      removed.push(`${impact.generatedExams.deleted} unfinished exam(s)`);
    if (impact.affectedUsers)
      removed.push(`cleared from ${impact.affectedUsers} user profile(s)`);
  }

  const adjusted: string[] = [];
  if (impact) {
    if (impact.generatedExams.pruned)
      adjusted.push(
        `${impact.generatedExams.pruned} unfinished exam(s) shrunk to their surviving questions`,
      );
    const dt = impact.detached;
    if (dt.subjects) adjusted.push(`${dt.subjects} subject(s) detached`);
    if (dt.chapters) adjusted.push(`${dt.chapters} chapter(s) detached`);
    if (dt.topics) adjusted.push(`${dt.topics} topic(s) detached`);
    if (dt.questions) adjusted.push(`${dt.questions} question(s) detached`);
  }

  const preservedTotal = impact
    ? impact.preserved.submittedExams +
      impact.preserved.answerScripts +
      impact.preserved.analyticsRows
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete"
        >
          <ArchiveX className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle>Delete {heading}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>"{name}"</strong>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {hasImpactEndpoint && (
          <div className="space-y-3 text-sm">
            {loadingImpact ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 bg-muted" />
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-2/3 bg-muted" />
              </div>
            ) : !impact ? null : removed.length === 0 && adjusted.length === 0 ? (
              <p className="text-muted-foreground">
                Nothing else references this {heading.toLowerCase()}.
              </p>
            ) : (
              <>
                {removed.length > 0 && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="font-medium text-destructive">
                      This will also delete
                    </p>
                    <ul className="mt-1 list-disc pl-5 space-y-0.5">
                      {removed.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {adjusted.length > 0 && (
                  <div className="rounded-lg border p-3">
                    <p className="font-medium">Kept, but changed</p>
                    <ul className="mt-1 list-disc pl-5 space-y-0.5 text-muted-foreground">
                      {adjusted.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {preservedTotal > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Results are kept: {impact.preserved.submittedExams} submitted
                    exam(s), {impact.preserved.answerScripts} answer script(s)
                    and {impact.preserved.analyticsRows} analytics row(s) stay as
                    they are.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <Button
            size="sm"
            variant="destructive"
            className="cursor-pointer"
            disabled={loadingImpact || deleting}
            onClick={handleDelete}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AllData({
  heading,
  route,
  fields,
}: {
  heading: string;
  route: string;
  fields: IField[];
}) {
  const [allData, setAllData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [queryFormData, setQueryFormData] = useState<IQueryFormData>({});
  const { masterData } = useMasterData();

  const updatedFields = useMemo(
    () => getQuestionDataOption(queryFormData, masterData, fields),
    [queryFormData, masterData, fields],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [queryFormData]);

  useEffect(() => {
    async function getAllData() {
      setLoading(true);
      const query: string[] = [];
      for (const key in queryFormData) {
        const value = queryFormData[key as keyof IQueryFormData];
        if (key === "name") {
          query.push(`search=${value}`);
          continue;
        }
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((v) => query.push(`${key}=${v}`));
        } else if (value) {
          query.push(`${key}=${value}`);
        }
      }
      const allDataQueryString = query.length ? "?" + query.join("&") : "";
      try {
        const res = await client.get(`${route}${allDataQueryString}`);
        const { data } = res;
        if (data.success) setAllData(data.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    getAllData();
  }, [route, queryFormData]);

  async function deleteData(id: string) {
    try {
      const res = await client.delete(`${route}/${id}`);
      const { data } = res;
      if (data.success) {
        setAllData((prev) => prev.filter((d) => d._id !== id));
        toast.success(data.message);
        return true;
      }
      toast.error(data.message);
      return false;
    } catch {
      toast.error("Server Error!");
      return false;
    }
  }

  // ── Active filter count ──────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    for (const key in queryFormData) {
      const value = queryFormData[key as keyof IQueryFormData];
      if (Array.isArray(value) ? value.length > 0 : Boolean(value)) count++;
    }
    return count;
  }, [queryFormData]);

  function clearFilters() {
    setQueryFormData({});
  }

  // ── Pagination ───────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(allData.length / PAGE_SIZE));
  const paginatedData = allData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function resolveCellValue(value: unknown): string {
    if (Array.isArray(value))
      return (value as { name: string }[]).map((v) => v.name).join(", ");
    if (typeof value === "object" && value !== null && "name" in value)
      return (value as { name: string }).name;
    return String(value ?? "—");
  }

  const filterFields =
    updatedFields?.filter((f: IField) => f.name !== "details") ?? [];
  const hasFilters = filterFields.length > 0;

  return (
    <div className="w-full space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">All {heading}s</h2>
          {!loading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {allData.length} record{allData.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      {hasFilters && (
        <Card className="rounded-xl border p-4 space-y-3">
          {/* Filter header row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Filters
              </span>
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 px-1.5 text-xs rounded-full"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </div>

            {/* Clear filters button — only visible when filters are active */}
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <FilterX className="w-3.5 h-3.5" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Filter inputs */}
          <div className="flex flex-wrap gap-3 ">
            {filterFields.map((field: IField, i: number) => (
              <div
                key={i}
                className="w-full sm:w-auto sm:min-w-45 flex-1 relative"
              >
                <DataField
                  formData={queryFormData}
                  setFormData={setQueryFormData}
                  field={field}
                  forAllDataPage={true}
                />

                {/* Per-field clear "×" pill — for inputs & selects only */}
                {field.inputType !== "checkbox" &&
                  (() => {
                    const val = (queryFormData as Record<string, unknown>)[
                      field.name
                    ];
                    const hasValue = Array.isArray(val)
                      ? val.length > 0
                      : Boolean(val);
                    return hasValue ? (
                      <button
                        aria-label={`Clear ${field.label}`}
                        onClick={() =>
                          setQueryFormData((prev) => ({
                            ...prev,
                            [field.name]: "",
                          }))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 transition-colors"
                      >
                        <X className="w-2.5 h-2.5 text-foreground" />
                      </button>
                    ) : null;
                  })()}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Table ───────────────────────────────────────────────── */}
      <Card className="rounded-xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10 text-center font-semibold text-xs uppercase tracking-wide">
                  #
                </TableHead>
                {fields.map((field, i) => (
                  <TableHead
                    key={i}
                    className="font-semibold text-xs uppercase tracking-wide whitespace-nowrap"
                  >
                    {field.label}
                  </TableHead>
                ))}
                <TableHead className="font-semibold text-xs uppercase tracking-wide text-right pr-4">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={fields.length + 2}>
                      <Skeleton className="h-5 w-full bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((data, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </TableCell>

                    {fields.map((field, i) => {
                      const raw = data[field.name as keyof DataType];
                      const display = resolveCellValue(raw);
                      const isBadge =
                        field.inputType === "select" ||
                        field.inputType === "checkbox";
                      return (
                        <TableCell
                          key={i}
                          className="whitespace-pre-wrap max-w-55 truncate text-sm"
                          title={display}
                        >
                          {isBadge && display !== "—" ? (
                            <Badge
                              variant="secondary"
                              className="text-xs font-normal"
                            >
                              {display}
                            </Badge>
                          ) : (
                            display
                          )}
                        </TableCell>
                      );
                    })}

                    <TableCell className="text-right pr-4">
                      <div className="flex gap-2 justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                        {/* Edit */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                              ref={closeRef}
                              aria-label="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg w-[95vw]">
                            <DialogHeader>
                              <DialogTitle>Update {heading}</DialogTitle>
                              <DialogDescription>
                                Changes will reflect immediately.
                              </DialogDescription>
                            </DialogHeader>
                            <UploadForm
                              formInfo={createFormInfo(
                                "PUT",
                                route,
                                fields,
                                data,
                              )}
                              closeRef={closeRef}
                            />
                          </DialogContent>
                        </Dialog>

                        {/* Delete */}
                        <DeleteRowDialog
                          heading={heading}
                          route={route}
                          id={data._id}
                          name={String(data["name" as keyof DataType] ?? "")}
                          onConfirm={deleteData}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={fields.length + 2}
                    className="text-center py-14 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ArchiveX className="w-8 h-8 opacity-30" />
                      <span className="text-sm">No data available</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── Pagination ──────────────────────────────────────────── */}
      {!loading && allData.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-4 flex-wrap py-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
