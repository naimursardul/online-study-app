import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, ListChecks, MousePointerClick, Trophy } from "lucide-react";
import { toast } from "sonner";
import { client } from "@/utils/utils";
import { useAuth } from "@/lib/Auth-context";
import SingleMcqQuestion from "@/components/qb/institution-question/single-question/single-mcq-question";
import { Button } from "@/components/ui/button";
import { McqQuestionSkeleton } from "@/components/skeleton/McqQuestionSkeleton";

import type {
  ExamSessionType,
  ExamStatusType,
  IMCQ,
  ExamReviewItemType,
  SingleMcqAnswerType,
} from "@/types/types";
import type { ExamResultSummary } from "@/components/exam/ExamResult";
import ExamReview from "@/components/exam/ExamReview";
import ExamResult from "@/components/exam/ExamResult";

type TakeState = "ready" | "started" | "finished";

function SingleExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamSessionType | null>(null);
  const [mode, setMode] = useState<"take" | "review">("take");

  // take-mode data
  const [questions, setQuestions] = useState<(IMCQ & { _id: string })[]>([]);
  const [answerScript, setAnswerScript] = useState<SingleMcqAnswerType[]>([]);
  const [takeState, setTakeState] = useState<TakeState>("ready");
  const [timeRemaining, setTimeRemaining] = useState(0); // ms
  const [summary, setSummary] = useState<ExamResultSummary | null>(null);

  // review-mode data
  const [reviewItems, setReviewItems] = useState<ExamReviewItemType[]>([]);

  const answerScriptRef = useRef<SingleMcqAnswerType[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    answerScriptRef.current = answerScript;
  }, [answerScript]);

  // =========================
  // FETCH EXAM
  // =========================
  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const res = await client.get(`/exam/${examId}`);
        if (!res.data?.success) {
          toast.error(res.data?.message || "Failed to load exam.");
          navigate("/exam");
          return;
        }
        const data = res.data.data;
        setExam(data.exam);
        setMode(data.mode);

        if (data.mode === "take") {
          const qs = data.questions as (IMCQ & { _id: string })[];
          setQuestions(qs);
          const initial = qs.map((q) => ({
            questionId: q._id,
            givenAns: undefined,
          }));
          setAnswerScript(initial);
          answerScriptRef.current = initial;
          setTimeRemaining((data.exam.totalTime || 0) * 1000);
        } else {
          setReviewItems(data.questions as ExamReviewItemType[]);
          setSummary(
            data.result
              ? {
                  correctCount: data.result.correctCount,
                  wrongCount: data.result.wrongCount,
                  obtainedMarks: data.result.obtainedMarks,
                  totalMarks: data.exam.totalMarks,
                  totalQuestions: data.result.totalQuestions,
                  percentage: data.result.percentage,
                }
              : null,
          );
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load exam.");
        navigate("/exam");
      } finally {
        setLoading(false);
      }
    };

    if (examId) fetchExam();

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const totalTime = useMemo(
    () => questions.reduce((a, q) => a + (q.timeRequired || 0), 0),
    [questions],
  );

  function clearTimer() {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }

  // =========================
  // SUBMIT
  // =========================
  async function handleSubmit() {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      clearTimer();
      const res = await client.post("/exam/create-answer", {
        u_id: user?._id,
        examId,
        answers: answerScriptRef.current,
        timeTaken: totalTime - timeRemaining / 1000,
      });

      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to submit exam.");
        return;
      }

      const answer = res.data.data?.answer;
      setSummary({
        correctCount: answer?.correctCount,
        wrongCount: answer?.wrongCount,
        obtainedMarks: answer?.obtainedMarks,
        totalMarks: answer?.totalMarks,
        totalQuestions: answer?.totalQuestions,
        percentage: answer?.percentage,
      });
      setTakeState("finished");
      toast.success("Exam submitted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting the exam.");
    } finally {
      isSubmittingRef.current = false;
    }
  }

  // =========================
  // START
  // =========================
  function handleStart() {
    clearTimer();
    setTakeState("started");
    countdownRef.current = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1000) {
          clearTimer();
          handleSubmit();
          return 0;
        }
        return t - 1000;
      });
    }, 1000);
  }

  // =========================
  // RENDER
  // =========================
  if (loading) {
    return (
      <div className="space-y-5">
        <McqQuestionSkeleton />
        <McqQuestionSkeleton />
        <McqQuestionSkeleton />
      </div>
    );
  }

  // ---- REVIEW MODE ----
  if (mode === "review") {
    return (
      <ExamReview
        examName={exam?.examName}
        items={reviewItems}
        summary={summary}
        onBack={() => navigate("/exam")}
      />
    );
  }

  // ---- TAKE MODE, finished ----
  if (takeState === "finished" && summary) {
    return (
      <ExamResult
        summary={summary}
        onReview={() => {
          // reload as review payload (status now submitted)
          navigate(0);
        }}
        onBack={() => navigate("/exam")}
      />
    );
  }

  // ---- TAKE MODE, ready ----
  if (takeState === "ready") {
    const minutes = Math.floor(timeRemaining / 1000 / 60);
    const seconds = Math.floor((timeRemaining / 1000) % 60);
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center gap-4 rounded-2xl border border-sidebar-border bg-background p-6 text-center">
        <h1 className="text-xl font-semibold">{exam?.examName}</h1>
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="flex flex-col items-center gap-1 rounded-lg bg-sidebar px-3 py-3">
            <ListChecks className="size-5 text-chart-2" />
            <span className="text-lg font-semibold">{questions.length}</span>
            <span className="text-xs text-muted-foreground">Questions</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-sidebar px-3 py-3">
            <Clock className="size-5 text-chart-2" />
            <span className="text-lg font-semibold">
              {minutes}m {seconds}s
            </span>
            <span className="text-xs text-muted-foreground">Time</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-sidebar px-3 py-3">
            <Trophy className="size-5 text-chart-2" />
            <span className="text-lg font-semibold">{exam?.totalMarks}</span>
            <span className="text-xs text-muted-foreground">Marks</span>
          </div>
        </div>
        <Button onClick={handleStart}>Start exam</Button>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <MousePointerClick className="size-4" />
          <span>Click Start to begin. The timer starts immediately.</span>
        </div>
      </div>
    );
  }

  // ---- TAKE MODE, started ----
  const minutes = Math.floor(timeRemaining / 1000 / 60);
  const seconds = Math.floor((timeRemaining / 1000) % 60);
  return (
    <div className="space-y-5">
      {/* Sticky timer */}
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-sidebar-border bg-background px-4 py-3">
        <span className="font-semibold">{exam?.examName}</span>
        <span className="flex items-center gap-1 font-mono text-chart-2">
          <Clock className="size-4" />
          {minutes}:{String(seconds).padStart(2, "0")}
        </span>
      </div>

      {questions.map((q, i) => (
        <SingleMcqQuestion
          key={q._id}
          q={q}
          i={i + 1}
          viewMode="practice"
          setAnswerScript={setAnswerScript}
          examStatus={takeState as ExamStatusType}
        />
      ))}

      <Button className="w-full" onClick={handleSubmit}>
        Submit
      </Button>
    </div>
  );
}

export default SingleExamPage;
