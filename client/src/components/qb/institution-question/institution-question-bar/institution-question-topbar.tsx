import FormatTime from "@/components/format-time/format-time";
import type { IqDetails, ViewModeType } from "@/types/types";

function InstitutionQuestionTopbar({
  qDetails,
  timeRemaining,
  examStatus,
  viewMode,
  setViewMode,
}: {
  qDetails?: IqDetails;
  timeRemaining: number;
  examStatus: "ready" | "started" | "finished";
  viewMode: ViewModeType;
  setViewMode: React.Dispatch<
    React.SetStateAction<"viewOnly" | "showAns" | "practice">
  >;
}) {
  return (
    <div className="flex flex-col gap-2 bg-background rounded sticky top-0 p-3 border-b-2 border-border z-50">
      <div className="flex gap-3 justify-between items-center">
        <div>
          <h3 className="font-semibold">
            {qDetails?.withName?.level} Board Question /{" "}
            {qDetails?.withName?.subject}
          </h3>
          <p className="text-xs text-chart-2 font-semibold">
            {qDetails?.withName?.institution &&
              qDetails?.withName?.year &&
              qDetails?.withName?.questionType &&
              `${qDetails?.withName?.institution} - ${qDetails?.withName?.year} (${qDetails?.withName?.questionType})`}
          </p>
        </div>

        {/*  */}
        {/*  */}
        {/* MODE SELECTOR */}
        {qDetails?.withName?.questionType === "MCQ" && (
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
              value={viewMode}
              className="border-none outline-none bg-sidebar-accent pl-2 py-2 rounded cursor-pointer"
            >
              <option value="viewOnly">View Only</option>
              <option value="showAns">Show Answer</option>
              <option value="practice">Practice</option>
            </select>
          </form>
        )}
      </div>
      {examStatus === "started" && <FormatTime timeRemaining={timeRemaining} />}
    </div>
  );
}

export default InstitutionQuestionTopbar;
