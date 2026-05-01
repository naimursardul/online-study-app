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

type OutletContextType = {
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  setExamStatus: React.Dispatch<React.SetStateAction<ExamStatusType>>;
  viewMode: ViewModeType;
  qDetails: IBoardQusetonDetails;
  examStatus: ExamStatusType;
};

function QuestionBankSlug2() {
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
  const { setTimeRemaining, setExamStatus, viewMode, qDetails, examStatus } =
    useOutletContext<OutletContextType>();

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
          //setting time remaining based on question time required
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

  //
  //
  // RESET QUESTION STATE ON QUESTION CHANGE
  useEffect(() => {
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
    }
    resetQuestionState();
  }, [slug2]);

  useEffect(() => {
    setAnswerScript(
      allQuestion.reduce(
        (acc: SingleMcqAnswerType[], curr: IBaseQuestion & { _id: string }) => {
          if (curr.questionType === "MCQ") {
            acc.push({
              id: curr._id,
              givenAns: undefined,
              mark: curr.marks,
              isCorrect: false,
            });
          }
          return acc;
        },
        []
      )
    );
  }, [allQuestion]);

  //
  //
  // CLEAR TIMER
  function clearTimer() {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }

  //
  //
  // MCQ SUBMIT HANDLER
  function handleMcqSubmit() {
    clearTimer();
    setTimeRemaining(totalTime * 1000);
    setExamStatus("finished");

    console.log(answerScript);
    const result = answerScript.reduce(
      (acc, item) => {
        acc.total += item.mark;

        if (item.isCorrect) {
          acc.correct += item.mark;

          acc.obtain += item.mark;
        }
        acc.wrong += item.mark;

        return acc;
      },
      {
        correct: 0,
        wrong: 0,
        obtain: 0,
        total: 0,
      }
    );

    setScriptRes(result);
  }

  //
  //
  // RESTART EXAM
  function handleRestart() {
    clearTimer();
    setScriptRes({
      correct: 0,
      wrong: 0,
      obtain: 0,
      total: 0,
    });
    setExamStatus("ready");
    setTimeRemaining(totalTime * 1000);
    setAnswerScript(() => {
      const initMcqAns: SingleMcqAnswerType[] = allQuestion.reduce(
        (acc: SingleMcqAnswerType[], curr: IBaseQuestion & { _id: string }) => {
          if (curr.questionType === "MCQ") {
            acc.push({
              id: curr._id,
              givenAns: undefined,
              mark: curr.marks,
              isCorrect: false,
            });
          }
          return acc;
        },
        []
      );

      return initMcqAns;
    });
  }

  //
  //
  // START EXAM
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
          handleMcqSubmit();
          return 0;
        }

        return time - 1000;
      });
    }, 1000);
    console.log("finished");
  }

  //
  //
  // TOTAL TIME
  const totalTime = useMemo(() => {
    return allQuestion.reduce((acc, cur) => {
      return acc + cur?.timeRequired;
    }, 0);
  }, [slug2, viewMode]);
  const totalMarks = useMemo(() => {
    return allQuestion.reduce((acc, cur) => acc + cur?.marks, 0);
  }, [slug2, viewMode]);

  console.log({ allQuestion });
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

  if (qDetails.questionType === "MCQ") {
    return (
      <div className="space-y-5">
        {viewMode === "practice" && examStatus === "finished" && (
          <>
            <div className="grid grid-cols-2 gap-2 border-2 border-sidebar-border bg-sidebar px-4 py-4 rounded text-chart-2">
              <div className="flex gap-1 items-center ">
                <ListOrdered className="size-5" /> <span>Total:</span>{" "}
                {scriptRes.total}
              </div>
              <div className="flex gap-1 items-center ">
                <CheckCircle2 className="size-5" /> <span>Correct:</span>{" "}
                {scriptRes.correct}
              </div>
              <div className="flex gap-1 items-center ">
                <Award className="size-5" /> <span>Obtain:</span>{" "}
                {scriptRes.obtain}
              </div>
              <div className="flex gap-1 items-center ">
                <XCircle className="size-5" /> <span>Wrong:</span>{" "}
                {scriptRes.wrong}
              </div>
            </div>

            <Button className="cursor-pointer" onClick={handleRestart}>
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
