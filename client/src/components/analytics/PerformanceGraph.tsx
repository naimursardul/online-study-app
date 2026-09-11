import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ApiErrorState from "@/components/shared/ApiErrorState";
import { client } from "@/utils/utils";

interface GraphItem {
  date: string;
  examName: string;
  subjectId: string | null;
  percentage: number;
  obtainedMarks: number;
  totalMarks: number;
}

interface Summary {
  totalExams: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  latestScore: number;
  improvement: number;
}

interface ApiResponse {
  graphData: GraphItem[];
  summary: Summary;
}

export default function PerformanceGraph({
  allSubjects,
}: {
  allSubjects: { _id: string; name: string }[];
}) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  // Bumped by the error state's retry button to re-run the fetch.
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    // Filter-driven refetch: abort the superseded request so a slow older
    // response cannot overwrite a newer filter's graph.
    const controller = new AbortController();

    const fetchGraph = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await client.get(
          `/analytics/performance-graph${selectedSubject !== "all" ? `?subjectId=${selectedSubject}` : ""}`,
          { signal: controller.signal },
        );

        // Keep-both-paths: the old server answered 200 with success:false.
        if (!response.data?.success || !response.data?.data) {
          setError(
            response.data?.message
              ? new Error(response.data.message)
              : undefined,
          );
          return;
        }
        setData(response.data.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchGraph();

    return () => controller.abort();
  }, [selectedSubject, reloadToken]);

  const selectedSubjectName = allSubjects.find(
    (s) => s._id === selectedSubject,
  )?.name;

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Filter by subject
        </span>

        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {allSubjects.map((subject) => (
              <SelectItem key={subject._id} value={subject._id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedSubject !== "all" && (
          <button
            onClick={() => setSelectedSubject("all")}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            Loading performance...
          </CardContent>
        </Card>
      ) : error !== null ? (
        <ApiErrorState
          error={error}
          message="Failed to load performance graph."
          onRetry={() => setReloadToken((t) => t + 1)}
        />
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total Exams" value={data.summary.totalExams} />
            <StatCard title="Average" value={`${data.summary.averageScore}%`} />
            <StatCard title="Best" value={`${data.summary.bestScore}%`} />
            <StatCard title="Worst" value={`${data.summary.worstScore}%`} />
            <StatCard title="Latest" value={`${data.summary.latestScore}%`} />
            <StatCard
              title="Improvement"
              value={`${data.summary.improvement}%`}
              highlight={
                data.summary.improvement > 0
                  ? "positive"
                  : data.summary.improvement < 0
                    ? "negative"
                    : "neutral"
              }
            />
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                Performance Trend
                {selectedSubject !== "all" && (
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    — {selectedSubjectName}
                  </span>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="h-87.5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value) =>
                        value != null
                          ? [`${value}%`, "Score"]
                          : ["N/A", "Score"]
                      }
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function StatCard({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string | number;
  highlight?: "positive" | "negative" | "neutral";
}) {
  const valueColor =
    highlight === "positive"
      ? "text-green-500"
      : highlight === "negative"
        ? "text-red-500"
        : "";

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <h3 className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</h3>
      </CardContent>
    </Card>
  );
}
