import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  CheckCircle2,
  ListOrdered,
  MousePointerClick,
  XCircle,
} from "lucide-react";
import { useOutletContext, useParams } from "react-router-dom";
import SingleCqQuestion from "@/components/qb/institution-question/single-question/single-cq-queston";
import SingleMcqQuestion from "@/components/qb/institution-question/single-question/single-mcq-question";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/utils";
import type {
  ExamStatusType,
  IBaseQuestion,
  IBoardQusetonDetails,
  ICQ,
  IMCQ,
  ScriptResType,
  SingleMcqAnswerType,
  ViewModeType,
} from "@/types/types";
import { McqQuestionSkeleton } from "@/components/skeleton/McqQuestionSkeleton";
import { CqQuestionSkeleton } from "@/components/skeleton/CqQuestionSkeleton";
import { useAuth } from "@/lib/Auth-context";
import { toast } from "sonner";

type OutletContextType = {
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  setExamStatus: React.Dispatch<React.SetStateAction<ExamStatusType>>;
  viewMode: ViewModeType;
  qDetails: IBoardQusetonDetails;
  examStatus: ExamStatusType;
};

function QuestionBankSlug2() {
  const { user } = useAuth();
  const { slug2 } = useParams();

  const [loading, setLoading] = useState(true);

  const [allQuestion, setAllQuestion] = useState<
    ((IMCQ | ICQ) & { _id: string })[]
  >([]);

  const [answerScript, setAnswerScript] = useState<SingleMcqAnswerType[]>([]);

  const [scriptRes, setScriptRes] = useState<ScriptResType>({
    correct: 0,
    wrong: 0,
    obtain: 0,
    total: 0,
  });

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ latest answerScript ref
  const answerScriptRef = useRef<SingleMcqAnswerType[]>([]);

  const {
    timeRemaining,
    setTimeRemaining,
    setExamStatus,
    viewMode,
    qDetails,
    examStatus,
  } = useOutletContext<OutletContextType>();

  // =========================
  // KEEP REF UPDATED
  // =========================
  useEffect(() => {
    answerScriptRef.current = answerScript;
  }, [answerScript]);

  // =========================
  // FETCH QUESTIONS
  // =========================
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);

      const params = new URLSearchParams();

      Object.entries(qDetails).forEach(([key, value]) => {
        if (key !== "questionType" && value) {
          params.append(key, String(value));
        }
      });

      try {
        const res = await client.post(`/question?${params.toString()}`, {
          questionType: qDetails.questionType,
          level: qDetails.level,
        });

        if (res.data?.success) {
          setAllQuestion(res.data.data);

          setTimeRemaining(
            (res.data.data as IBaseQuestion[]).reduce((acc, cur) => {
              return acc + cur?.timeRequired;
            }, 0) * 1000
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [qDetails]);

  // =========================
  // TOTAL TIME
  // =========================
  const totalTime = useMemo(() => {
    return allQuestion.reduce((acc, cur) => {
      return acc + cur?.timeRequired;
    }, 0);
  }, [slug2, viewMode, allQuestion]);

  const totalMarks = useMemo(() => {
    return allQuestion.reduce((acc, cur) => acc + cur?.marks, 0);
  }, [slug2, viewMode, allQuestion]);

  // =========================
  // CLEAR TIMER
  // =========================
  function clearTimer() {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }

  // =========================
  // RESET QUESTION STATE
  // =========================
  function resetQuestionState() {
    clearTimer();

    setScriptRes({
      correct: 0,
      wrong: 0,
      obtain: 0,
      total: 0,
    });

    setTimeRemaining(totalTime * 1000);

    setExamStatus("ready");

    const initialAnswers = allQuestion.reduce(
      (acc: SingleMcqAnswerType[], curr: IBaseQuestion & { _id: string }) => {
        if (curr.questionType === "MCQ") {
          acc.push({
            questionId: curr._id,
            givenAns: undefined,
          });
        }

        return acc;
      },
      []
    );

    setAnswerScript(initialAnswers);

    // update ref immediately
    answerScriptRef.current = initialAnswers;
  }

  useEffect(() => {
    resetQuestionState();
  }, [slug2, allQuestion]);

  // =========================
  // MCQ SUBMIT
  // =========================
  async function handleMcqSubmit() {
    try {
      clearTimer();
      console.log("Submitting:", timeRemaining);

      const res = await client.post("/exam/create-answer", {
        u_id: user?._id,

        examName: `${qDetails.level} - ${qDetails.subject} - ${qDetails.institution} - ${qDetails.year}`,

        // ✅ latest data
        answers: answerScriptRef.current,

        timeTaken: totalTime - timeRemaining / 1000,
      });

      if (!res.data.success) {
        toast.error("Failed to submit exam. Please try again.");
        return;
      }

      setScriptRes({
        correct: res.data.data.correctCount,
        wrong: res.data.data.wrongCount,
        obtain: res.data.data.obtainedMarks,
        total: res.data.data.totalMarks,
      });

      setExamStatus("finished");
    } catch (error) {
      console.log(error);

      toast.error("An error occurred while submitting the exam.");
    }
  }

  // =========================
  // START EXAM
  // =========================
  function handleStart() {
    clearTimer();

    setScriptRes({
      correct: 0,
      wrong: 0,
      obtain: 0,
      total: 0,
    });

    setExamStatus("started");

    countdownRef.current = setInterval(() => {
      setTimeRemaining((time) => {
        if (time <= 1000) {
          clearTimer();

          // ✅ latest answerScript available
          handleMcqSubmit();

          return 0;
        }

        return time - 1000;
      });
    }, 1000);
  }

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return qDetails?.questionType === "MCQ" ? (
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
  if (qDetails.questionType === "MCQ") {
    return (
      <div className="space-y-5">
        {viewMode === "practice" && examStatus === "finished" && (
          <>
            <div className="grid grid-cols-2 gap-2 border-2 border-sidebar-border bg-sidebar px-4 py-4 rounded text-chart-2">
              <div className="flex gap-1 items-center">
                <ListOrdered className="size-5" />
                <span>Total:</span>
                {scriptRes.total}
              </div>

              <div className="flex gap-1 items-center">
                <CheckCircle2 className="size-5" />
                <span>Correct:</span>
                {scriptRes.correct}
              </div>

              <div className="flex gap-1 items-center">
                <Award className="size-5" />
                <span>Obtain:</span>
                {scriptRes.obtain}
              </div>

              <div className="flex gap-1 items-center">
                <XCircle className="size-5" />
                <span>Wrong:</span>
                {scriptRes.wrong}
              </div>
            </div>

            <Button className="cursor-pointer" onClick={resetQuestionState}>
              Restart
            </Button>
          </>
        )}

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
              setAnswerScript={setAnswerScript}
              examStatus={examStatus}
            />
          ))}

        {viewMode === "practice" && examStatus === "started" && (
          <Button className="w-full" onClick={handleMcqSubmit}>
            Submit
          </Button>
        )}

        {viewMode === "practice" && examStatus === "ready" && (
          <div className="flex flex-col gap-2 justify-center items-center text-chart-2 font-semibold">
            <div>Total MCQ: {allQuestion.length}</div>

            <div>Time: {totalTime}</div>

            <div>Total Marks: {totalMarks}</div>

            <Button className="cursor-pointer" onClick={handleStart}>
              Start
            </Button>

            <div className="flex gap-2">
              <MousePointerClick />
              <span>Click Start button to begin exam</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================
  // CQ VIEW
  // =========================
  if (qDetails.questionType === "CQ") {
    return (
      <div className="space-y-5">
        {allQuestion.map((q, i) => (
          <SingleCqQuestion key={q._id} q={q as ICQ} i={i + 1} />
        ))}
      </div>
    );
  }

  return null;
}

export default QuestionBankSlug2;
