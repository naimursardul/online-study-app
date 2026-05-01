import SingleQuestionBankSidebar from "@/components/qb/institution-question/institution-question-bar/institution-question-sidebar";
import InstitutionQuestionTopbar from "@/components/qb/institution-question/institution-question-bar/institution-question-topbar";
import { getBoardQusetonDetails } from "@/lib/utils";
import type { ExamStatusType, ViewModeType } from "@/types/types";

import { useEffect, useMemo, useState } from "react";

import { Outlet, useParams } from "react-router-dom";

function InstitutionQuestionLayout() {
  const { slug1, slug2 } = useParams();

  const qDetails = useMemo(
    () => getBoardQusetonDetails(slug1 + (slug2 ? `_${slug2}` : "")),
    [slug1, slug2]
  );

  const [viewMode, setViewMode] = useState<ViewModeType>("viewOnly");

  const [examStatus, setExamStatus] = useState<ExamStatusType>("ready");

  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    setViewMode("viewOnly");
    setExamStatus("ready");
    setTimeRemaining(10 * 1000);
  }, [slug1, slug2]);

  return (
    <div className="flex flex-col md:flex-row gap-3 mt-10">
      <SingleQuestionBankSidebar slug={slug1} />

      <div className="w-full space-y-8">
        <InstitutionQuestionTopbar
          qDetails={qDetails}
          timeRemaining={timeRemaining}
          viewMode={viewMode}
          setViewMode={setViewMode}
          examStatus={examStatus}
        />

        <main>
          <Outlet
            context={{
              setTimeRemaining,
              setExamStatus,
              viewMode,
              qDetails,
              examStatus,
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default InstitutionQuestionLayout;
