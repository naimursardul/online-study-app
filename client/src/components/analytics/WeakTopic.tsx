import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { client, extractIdTo_ } from "@/utils/utils";
import type { IMasterData } from "@/types/types";

interface WeakTopic {
  topicId: string;
  subjectId: string;
  chapterId: string;
  correct: number;
  total: number;
  accuracy: number;
}

function AccuracyBar({ accuracy }: { accuracy: number }) {
  const color =
    accuracy < 40
      ? "bg-red-500"
      : accuracy < 70
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="flex items-center gap-3 min-w-35">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${accuracy}%` }}
        />
      </div>
      <span
        className={`text-sm font-semibold tabular-nums w-12 text-right ${
          accuracy < 40
            ? "text-red-500"
            : accuracy < 70
              ? "text-amber-500"
              : "text-emerald-600"
        }`}
      >
        {accuracy}%
      </span>
    </div>
  );
}

function AccuracyBadge({ accuracy }: { accuracy: number }) {
  if (accuracy < 40)
    return (
      <Badge variant="destructive" className="text-xs">
        Critical
      </Badge>
    );
  if (accuracy < 70)
    return (
      <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
        Needs work
      </Badge>
    );
  return (
    <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
      Fair
    </Badge>
  );
}

export default function WeakTopics({
  masterData,
  allSubjects,
}: {
  masterData: IMasterData;
  allSubjects: IMasterData["subjects"];
}) {
  const [topics, setTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [limit, setLimit] = useState("5");

  useEffect(() => {
    const fetchWeakTopics = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({ limit });
        if (selectedSubject !== "all") params.set("subjectId", selectedSubject);

        const response = await client.get(
          `/analytics/weak-topics?${params.toString()}`,
        );

        setTopics(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load weak topics");
      } finally {
        setLoading(false);
      }
    };

    fetchWeakTopics();
  }, [selectedSubject, limit]);

  const selectedSubjectName =
    allSubjects.find((s) => s._id === selectedSubject)?.name ?? null;

  return (
    <Card>
      <CardHeader>
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {allSubjects.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["5", "10", "15", "20"].map((n) => (
                <SelectItem key={n} value={n}>
                  Top {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedSubject !== "all" && (
            <button
              onClick={() => setSelectedSubject("all")}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Active filter label */}
        {selectedSubjectName && (
          <p className="mt-1 text-xs text-muted-foreground ">
            Showing results for{" "}
            <span className="font-medium text-foreground">
              {selectedSubjectName}
            </span>
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: Number(limit) > 5 ? 5 : Number(limit) }).map(
              (_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg bg-muted animate-pulse"
                />
              ),
            )}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => setSelectedSubject("all")}
              className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground"
            >
              Reset filters
            </button>
          </div>
        ) : topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-1">
            <p className="text-sm font-medium">No weak topics found</p>
            <p className="text-xs text-muted-foreground">
              {selectedSubject !== "all"
                ? "Try a different subject or clear the filter."
                : "Keep practicing to see insights here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {topics.map((topic, index) => (
              <div
                key={topic.topicId}
                className="flex justify-between max-sm:flex-col items-center max-sm:items-start gap-3 py-3"
              >
                <div className="flex gap-3 items-center">
                  {/* Rank */}
                  <span className="text-xs font-mono text-muted-foreground w-5 shrink-0 text-center">
                    {index + 1}
                  </span>

                  {/* Topic info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {extractIdTo_(masterData.topics, topic.topicId, "name")}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {extractIdTo_(allSubjects, topic.subjectId, "name")}
                      {" . "}
                      {topic.chapterId
                        ? extractIdTo_(
                            masterData.chapters,
                            topic.chapterId,
                            "name",
                          )
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  {/* Badge */}
                  <div className="shrink-0 ">
                    <AccuracyBadge accuracy={topic.accuracy} />
                  </div>

                  {/* Attempts */}
                  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                    {topic.correct}/{topic.total} correct
                  </span>

                  {/* Bar */}
                  <div className="shrink-0 w-36 ">
                    <AccuracyBar accuracy={topic.accuracy} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
