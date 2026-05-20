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
import { client } from "@/utils/utils";

interface GraphItem {
  date: string;
  examName: string;
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
}

export default function PerformanceGraph({ userId }: Props) {
  const [data, setData] = useState<ApiResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setLoading(true);

        const response = await client.get(
          `/analytics/performance-graph/${userId}`,
        );

        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load graph");
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">Loading performance...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-red-500">{error}</CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Exams" value={data.summary.totalExams} />

        <StatCard title="Average" value={`${data.summary.averageScore}%`} />

        <StatCard title="Best" value={`${data.summary.bestScore}%`} />

        <StatCard title="Worst" value={`${data.summary.worstScore}%`} />

        <StatCard title="Latest" value={`${data.summary.latestScore}%`} />

        <StatCard title="Improvement" value={`${data.summary.improvement}%`} />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.graphData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis domain={[0, 100]} />

                <Tooltip />

                <Line type="monotone" dataKey="percentage" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>

        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </CardContent>
    </Card>
  );
}
