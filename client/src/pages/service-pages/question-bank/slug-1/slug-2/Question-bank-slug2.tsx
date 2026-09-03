import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import SingleCqQuestion from "@/components/qb/institution-question/single-question/single-cq-queston";
import SingleMcqQuestion from "@/components/qb/institution-question/single-question/single-mcq-question";
import SingleWrittenQuestion from "@/components/qb/institution-question/single-question/single-written-question";
import { Button } from "@/components/ui/button";
import { client } from "@/utils/utils";
import type {
  ExamStatusType,
  IBaseQuestion,
  ICQ,
  IMCQ,
  IqDetails,
  IWritten,
  ViewModeType,
} from "@/types/types";
import { McqQuestionSkeleton } from "@/components/skeleton/McqQuestionSkeleton";
import { CqQuestionSkeleton } from "@/components/skeleton/CqQuestionSkeleton";
import { toast } from "sonner";
import Loader from "@/components/loader/Loader";
import { familyOf } from "@/utils/questionTypes";

type OutletContextType = {
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  setExamStatus: React.Dispatch<React.SetStateAction<ExamStatusType>>;
  viewMode: ViewModeType;
  qDetails: IqDetails;
  examStatus: ExamStatusType;
};

function QuestionBankSlug2() {
  const [loading, setLoading] = useState<{
    question: boolean;
    generateExam: boolean;
  }>({
    question: true,
    generateExam: false,
  });

  const [allQuestion, setAllQuestion] = useState<
    ((IMCQ | ICQ | IWritten) & { _id: string })[]
  >([]);

  const navigate = useNavigate();

  const { setTimeRemaining, viewMode, qDetails, examStatus } =
    useOutletContext<OutletContextType>();

  // The slug's type decides the shape of the paper: MCQ, a cq-family paper
  // (CQ / Math CQ) or a written one (SQ / EQ / WQ).
  const family = familyOf(qDetails?.withId?.questionType ?? "");

  // =========================
  // FETCH QUESTIONS
  // =========================
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading((prev) => ({ ...prev, question: true }));

      const params = new URLSearchParams();

      Object.entries(qDetails.withId).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        if (Array.isArray(value)) {
          value.forEach((item) => params.append(key, String(item)));
        } else {
          params.append(key, String(value));
        }
      });

      try {
        const res = await client.get(`/question?${params.toString()}`);

        console.log(res.data);
        if (res.data?.success) {
          setAllQuestion(res.data.data);

          setTimeRemaining(
            (res.data.data as IBaseQuestion[]).reduce((acc, cur) => {
              return acc + cur?.timeRequired;
            }, 0) * 1000,
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading((prev) => ({ ...prev, question: false }));
      }
    };

    fetchQuestions();
  }, [qDetails]);

  // =========================
  // START EXAM
  // =========================
  async function handleStart() {
    setLoading((prev) => ({ ...prev, generateExam: true }));
    const { institution, year } = qDetails.withName;
    const { levelId, subjectId, recordId, questionType } = qDetails.withId;
    try {
      const res = await client.post("/exam/generate", {
        examCategory: "record",
        examName: questionType + "-" + institution + "-" + year,
        subjectId,
        filter: { levelId, recordId },
      });

      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to generate exam.");
        return;
      }
      navigate(`/exam/${res.data.data.exam._id}`);
    } catch (error) {
      // Axios puts the server's own message on the response body.
      const message = (
        error as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      toast.error(message || "Failed to generate exam.");
    } finally {
      setLoading((prev) => ({ ...prev, generateExam: false }));
    }
  }

  if (loading.question) {
    // Written papers are closer to a CQ in height, so they borrow its skeleton.
    return family === "mcq" ? (
      <div className="space-y-5">
        <McqQuestionSkeleton />
        <McqQuestionSkeleton />
        <McqQuestionSkeleton />
      </div>
    ) : (
      <div className="space-y-5">
        <CqQuestionSkeleton />
        <CqQuestionSkeleton />
        <CqQuestionSkeleton />
      </div>
    );
  }

  // =========================
  // MCQ VIEW
  // =========================
  if (family === "mcq") {
    return (
      <div className="space-y-5">
        {((viewMode === "practice" && examStatus !== "ready") ||
          viewMode !== "practice") &&
          allQuestion.map((q, i) => (
            <SingleMcqQuestion
              key={q._id}
              q={
                q as IMCQ & {
                  _id: string;
                }
              }
              i={i + 1}
              viewMode={viewMode}
              examStatus={examStatus}
            />
          ))}

        {viewMode === "practice" && examStatus === "ready" && (
          <div className="flex flex-col gap-2 justify-center items-center text-chart-2 font-semibold">
            <>
              {loading.generateExam ? (
                <Loader />
              ) : (
                <Button className="cursor-pointer" onClick={handleStart}>
                  Ready for the exam!
                </Button>
              )}
            </>
          </div>
        )}
      </div>
    );
  }

  // =========================
  // CQ VIEW (CQ / Math CQ)
  // =========================
  if (family === "cq") {
    return (
      <div className="space-y-5">
        {allQuestion.map((q, i) => (
          <SingleCqQuestion
            key={q._id}
            q={q as ICQ & { _id: string }}
            i={i + 1}
          />
        ))}
      </div>
    );
  }

  // =========================
  // WRITTEN VIEW (SQ / EQ / WQ)
  // =========================
  if (family === "simple") {
    return (
      <div className="space-y-5">
        {allQuestion.map((q, i) => (
          <SingleWrittenQuestion
            key={q._id}
            q={q as IWritten & { _id: string }}
            i={i + 1}
          />
        ))}
      </div>
    );
  }

  // Only reachable when the slug carries a type this app does not know.
  return (
    <div className="text-center py-10 text-muted-foreground">
      This question type is not available.
    </div>
  );
}

export default QuestionBankSlug2;
