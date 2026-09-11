import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, ListChecks, MousePointerClick, Trophy } from "lucide-react";
import { toast } from "sonner";
import { client } from "@/utils/utils";
import SingleMcqQuestion from "@/components/qb/institution-question/single-question/single-mcq-question";
import { Button } from "@/components/ui/button";
import { McqQuestionSkeleton } from "@/components/skeleton/McqQuestionSkeleton";
import ApiErrorState from "@/components/shared/ApiErrorState";

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

  const [loading, setLoading] = useState(true);
  // A failed load renders an error state with retry here; navigating back to
  // /exam ejected the user from the page over a transient blip.
  const [loadError, setLoadError] = useState<unknown>(null);
  const [exam, setExam] = useState<ExamSessionType | null>(null);
  const [mode, setMode] = useState<"take" | "review">("take");

  // take-mode data
  const [questions, setQuestions] = useState<(IMCQ & { _id: string })[]>([]);
  const [answerScript, setAnswerScript] = useState<SingleMcqAnswerType[]>([]);
  const [takeState, setTakeState] = useState<TakeState>("ready");
  const [timeRemaining, setTimeRemaining] = useState(0); // ms
  const [summary, setSummary] = useState<ExamResultSummary | null>(null);
  // A failed submit must offer a retry, not strand the user at 00:00 with no
  // viable action — this is the one client path that can destroy user work.
  const [submitError, setSubmitError] = useState<unknown>(null);

  // review-mode data
  const [reviewItems, setReviewItems] = useState<ExamReviewItemType[]>([]);

  const answerScriptRef = useRef<SingleMcqAnswerType[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSubmittingRef = useRef(false);

  // The in-progress answer script is persisted here so a reload (or the failed
  // auto-submit at 00:00) cannot silently lose a completed exam.
  const storageKey = examId ? `exam-answers-${examId}` : null;

  useEffect(() => {
    answerScriptRef.current = answerScript;
    if (storageKey && takeState === "started" && answerScript.length > 0) {
      sessionStorage.setItem(storageKey, JSON.stringify(answerScript));
    }
  }, [answerScript, takeState, storageKey]);

  // =========================
  // FETCH EXAM
  // =========================
  const fetchExam = async () => {
    setLoading(true);
    setLoadError(null);
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
        // Restore any answers persisted before a reload of this exam.
        const savedMap = new Map<string, string>();
        if (storageKey) {
          try {
            const saved: unknown = JSON.parse(
              sessionStorage.getItem(storageKey) ?? "[]",
            );
            if (Array.isArray(saved)) {
              for (const entry of saved) {
                if (
                  entry &&
                  typeof entry === "object" &&
                  typeof (entry as SingleMcqAnswerType).questionId === "string"
                ) {
                  savedMap.set(
                    (entry as SingleMcqAnswerType).questionId,
                    (entry as SingleMcqAnswerType).givenAns ?? "",
                  );
                }
              }
            }
          } catch {
            // A corrupt entry is not worth failing the exam over — start fresh.
          }
        }
        const initial = qs.map((q) => ({
          questionId: q._id,
          givenAns: savedMap.get(q._id) ?? "",
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
      setLoadError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      // u_id is derived from the session server-side; sending it from client
      // state posted `undefined` whenever the auth context had not resolved.
      clearTimer();
      const res = await client.post("/exam/create-answer", {
        examId,
        answers: answerScriptRef.current,
        timeTaken: totalTime - timeRemaining / 1000,
      });

      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to submit exam.");
        setSubmitError(res.data?.message || "Failed to submit exam.");
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
      setSubmitError(null);
      // The exam is graded and stored server-side; the draft is no longer needed.
      if (storageKey) sessionStorage.removeItem(storageKey);
      toast.success("Exam submitted successfully!");
    } catch (error) {
      console.error(error);
      setSubmitError(error);
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

  // ---- LOAD FAILED ----
  if (loadError !== null) {
    return (
      <ApiErrorState
        error={loadError}
        message="Failed to load exam."
        onRetry={fetchExam}
      />
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

      {submitError !== null && (
        <ApiErrorState
          error={submitError}
          message="Your answers are still here — submitting failed, but you can try again."
          onRetry={handleSubmit}
        />
      )}

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={timeRemaining <= 0 && submitError === null}
      >
        Submit
      </Button>
    </div>
  );
}

export default SingleExamPage;
