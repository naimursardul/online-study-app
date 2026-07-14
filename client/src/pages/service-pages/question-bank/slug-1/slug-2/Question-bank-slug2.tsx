import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import SingleCqQuestion from "@/components/qb/institution-question/single-question/single-cq-queston";
import SingleMcqQuestion from "@/components/qb/institution-question/single-question/single-mcq-question";
import { Button } from "@/components/ui/button";
import { client } from "@/utils/utils";
import type {
  ExamStatusType,
  IBaseQuestion,
  ICQ,
  IMCQ,
  IqDetails,
  ViewModeType,
} from "@/types/types";
import { McqQuestionSkeleton } from "@/components/skeleton/McqQuestionSkeleton";
import { CqQuestionSkeleton } from "@/components/skeleton/CqQuestionSkeleton";
import { toast } from "sonner";
import Loader from "@/components/loader/Loader";

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
    ((IMCQ & { _id: string }) | (ICQ & { _id: string }))[]
  >([]);

  const navigate = useNavigate();

  const { setTimeRemaining, viewMode, qDetails, examStatus } =
    useOutletContext<OutletContextType>();

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
    const { level, subject, institution, year } = qDetails.withName;
    const { levelId, subjectId, recordId, questionType } = qDetails.withId;
    try {
      const res = await client.post("/exam/generate", {
        examCategory: "record",
        examName:
          level +
          "-" +
          subject +
          "-" +
          questionType +
          "-" +
          institution +
          "-" +
          year,
        subjectId,
        filter: { levelId, recordId },
      });

      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to generate exam.");
        return;
      }
      navigate(`/exam/${res.data.data.exam._id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to generate exam.");
    } finally {
      setLoading((prev) => ({ ...prev, generateExam: false }));
    }
  }

  if (loading.question) {
    return qDetails?.withId?.questionType === "MCQ" ? (
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
  if (qDetails.withId.questionType === "MCQ") {
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
  // CQ VIEW
  // =========================
  if (qDetails.withId.questionType === "CQ") {
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

  return null;
}

export default QuestionBankSlug2;
