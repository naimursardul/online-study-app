import { useEffect, useState } from "react";
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
import { client } from "@/utils/utils";

interface GraphItem {
  date: string;
  examName: string;
  subject: string | null;
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

interface Props {
  userId: string;
  allSubjects: { _id: string; name: string }[];
}

export default function PerformanceGraph({ userId, allSubjects }: Props) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  console.log(allSubjects);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  // Re-fetch whenever the subject filter changes
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setLoading(true);
        setError("");
        console.log(
          `/analytics/performance-graph/${userId}${selectedSubject !== "all" ? `?subjectId=${selectedSubject}` : ""}`,
        );

        const response = await client.get(
          `/analytics/performance-graph/${userId}${selectedSubject !== "all" ? `?subjectId=${selectedSubject}` : ""}`,
        );

        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load graph");
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [userId, selectedSubject]);

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
            {allSubjects.map((subject, i) => (
              <SelectItem key={i} value={subject?._id}>
                {subject?.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Active filter badge */}
        {selectedSubject !== "all" && (
          <button
            onClick={() => setSelectedSubject("all")}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            Loading performance...
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-red-500">{error}</CardContent>
        </Card>
      ) : data ? (
        <>
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
                    — {selectedSubject}
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
