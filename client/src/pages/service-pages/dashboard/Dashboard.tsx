import PerformanceGraph from "@/components/analytics/PerformanceGraph";
import WeakTopics from "@/components/analytics/WeakTopic";
import { useAuth } from "@/lib/Auth-context";
import type { IMasterData } from "@/types/types";
import { useOutletContext } from "react-router-dom";

function Dashboard() {
  const { user } = useAuth();
  const allSubjects = useOutletContext<IMasterData>()?.subjects || [];
  console.log(allSubjects);
  return (
    <div className="py-4 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <PerformanceGraph
        allSubjects={allSubjects.filter(
          (s) =>
            String(s.levelId) === user?.level._id &&
            String(s.backgroundId).includes(user?.background._id),
        )}
      />

      <WeakTopics
        allSubjects={allSubjects.filter(
          (s) =>
            String(s.levelId) === user?.level._id &&
            String(s.backgroundId).includes(user?.background._id),
        )}
      />
    </div>
  );
}

export default Dashboard;
