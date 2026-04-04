import FormatTime from "@/components/format-time/format-time";
import type { IBoardQusetonDetails } from "@/types/types";

function InstitutionQuestionTopbar({
  qDetails,
  timeRemaining,
  examStatus,
  setViewMode,
}: {
  qDetails?: IBoardQusetonDetails;
  timeRemaining: number;
  examStatus: "ready" | "started" | "finished";
  setViewMode: React.Dispatch<
    React.SetStateAction<"viewOnly" | "showAns" | "practice">
  >;
}) {
  return (
    <div>
      {/* TOPBAR */}
      <div className="flex flex-col gap-2 bg-background rounded sticky top-0 p-3 border-b-2 border-border ">
        <div className="flex gap-3 justify-between items-center ">
          <div>
            <h3 className="font-semibold">
              {qDetails?.level} Board Question / {qDetails?.subject}
            </h3>
            <p className="text-xs text-chart-2 font-semibold">
              {qDetails?.institution &&
                qDetails?.year &&
                qDetails?.questionType &&
                `${qDetails?.institution} - ${qDetails?.year} (${qDetails?.questionType})`}
            </p>
          </div>

          {/*  */}
          {/*  */}
          {/* MODE SELECTOR */}
          {qDetails?.questionType === "MCQ" && (
            <form
              onChange={(e: React.ChangeEvent<HTMLFormElement>) =>
                setViewMode(e.target?.value)
              }
              className="flex flex-col gap-1 text-xs md:text-sm font-semibold"
            >
              <select
                name="viewMode"
                id="viewMode"
                disabled={examStatus === "started"}
                className="border-none outline-none bg-sidebar-accent pl-2 py-2 rounded cursor-pointer"
              >
                <option value="viewOnly" defaultChecked>
                  View Only
                </option>
                <option value="showAns">Show Answer</option>
                <option value="practice">Practice</option>
              </select>
            </form>
          )}
        </div>
        {examStatus === "started" && (
          <FormatTime timeRemaining={timeRemaining} />
        )}
      </div>
    </div>
  );
}

export default InstitutionQuestionTopbar;
