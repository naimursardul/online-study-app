import PerformanceGraph from "@/components/analytics/PerformanceGraph";
import { useAuth } from "@/lib/Auth-context";

function Dashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {user?._id ? (
        <PerformanceGraph userId={user?._id} />
      ) : (
        <p className="text-gray-500 mt-4">
          Please log in to view your performance graph.
        </p>
      )}
    </div>
  );
}

export default Dashboard;
