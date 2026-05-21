import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Activity } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ISubject } from "@/types/types";
import { client } from "@/utils/utils";

interface DashboardStatsData {
  overallAccuracy: number;
  totalAttempts: number;
  correctAttempts: number;
  wrongAttempts: number;
}

function AccuracyRing({ value }: { value: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const color = value >= 75 ? "#22c55e" : value >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg
        className="-rotate-90"
        width="144"
        height="144"
        viewBox="0 0 144 144"
      >
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-muted/20"
        />
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {value}%
        </span>
        <span className="text-xs text-muted-foreground">accuracy</span>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  loading: boolean;
}) {
  return (
    <Card className="flex-1 min-w-35">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-7 w-16 mb-1" />
        ) : (
          <p className="text-2xl font-bold tabular-nums">
            {value.toLocaleString()}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardStats({
  allSubjects,
}: {
  allSubjects: (ISubject & { _id: string })[];
}) {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedSubject !== "all") params.set("subjectId", selectedSubject);

      const { data } = await client.get(
        `analytics/dashboard-stats?${params.toString()}`,
      );
      setStats(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedSubject]);

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
  };

  const accuracyLabel =
    !stats || loading
      ? null
      : stats.overallAccuracy >= 75
        ? { label: "Excellent", variant: "default" as const }
        : stats.overallAccuracy >= 50
          ? { label: "Average", variant: "secondary" as const }
          : { label: "Needs Work", variant: "destructive" as const };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Performance Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Your quiz analytics at a glance
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Filter by subject
          </span>
          <Select value={selectedSubject} onValueChange={handleSubjectChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {allSubjects.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name}
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
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Accuracy Ring + Badge */}
      <Card>
        <CardContent className="pt-6 pb-5 flex flex-col items-center gap-3">
          {loading ? (
            <Skeleton className="w-36 h-36 rounded-full" />
          ) : (
            <AccuracyRing value={stats?.overallAccuracy ?? 0} />
          )}
          {accuracyLabel && (
            <Badge variant={accuracyLabel.variant}>{accuracyLabel.label}</Badge>
          )}
          <p className="text-sm text-muted-foreground">Overall Accuracy</p>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="flex gap-3 flex-wrap">
        <StatCard
          icon={Activity}
          label="Total Attempts"
          value={stats?.totalAttempts ?? 0}
          color="bg-blue-500/10 text-blue-500"
          loading={loading}
        />
        <StatCard
          icon={CheckCircle2}
          label="Correct"
          value={stats?.correctAttempts ?? 0}
          color="bg-green-500/10 text-green-500"
          loading={loading}
        />
        <StatCard
          icon={XCircle}
          label="Wrong"
          value={stats?.wrongAttempts ?? 0}
          color="bg-red-500/10 text-red-500"
          loading={loading}
        />
      </div>
    </div>
  );
}
