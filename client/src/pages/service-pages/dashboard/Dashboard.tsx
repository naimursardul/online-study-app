import DashboardSummary from "@/components/analytics/DashboardSummary";
import PerformanceGraph from "@/components/analytics/PerformanceGraph";
import WeakTopics from "@/components/analytics/WeakTopic";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/Auth-context";
import type { IMasterData } from "@/types/types";
import { useOutletContext } from "react-router-dom";

function Dashboard() {
  const { user } = useAuth();
  const allSubjects = useOutletContext<IMasterData>()?.subjects || [];
  const allChapters = useOutletContext<IMasterData>()?.chapters || [];
  const masterData = useOutletContext<IMasterData>();

  const filteredSubjects = allSubjects.filter(
    (s) =>
      String(s.levelId) === user?.level._id &&
      String(s.backgroundId).includes(user?.background._id),
  );

  return (
    <div className="py-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Analytics
        </span>

        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Welcome back, {user?.name} 👋
        </h1>

        <p className="text-sm text-muted-foreground">
          Monitor your performance, track progress, and improve weaker areas.
        </p>
      </div>
      <DashboardSummary allSubjects={filteredSubjects} />

      {/* Performance Analytics */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Performance Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Overview of your last 20 exam performance and progress.
          </p>
        </div>

        <PerformanceGraph allSubjects={filteredSubjects} />
      </section>

      <Separator />

      {/* Weak Topics */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Weak Topic Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Identify subjects and topics that need more attention.
          </p>
        </div>

        <WeakTopics
          allSubjects={filteredSubjects}
          allChapters={allChapters}
          masterData={masterData}
        />
      </section>
    </div>
  );
}

export default Dashboard;
