"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ICQ, IMCQ, ScriptResType, SingleMcqAnswerType } from "@/lib/type";
import FormatTime from "../format-time";
import { MousePointerClick, TextSelect } from "lucide-react";
import SingleCqQuestion from "./single-question/single-cq-queston";
import SingleMcqQuestion from "./single-question/single-mcq-question";

export default function SingleQuestionBank({
  qDetails,
}: {
  qDetails?: Record<string, string>;
}) {
  //
  //
  // ALL VARIABLES
  const [viewMode, setViewMode] = useState<"viewOnly" | "showAns" | "practice">(
    "viewOnly"
  );
  const [allQuestion, setAllQuestion] = useState<
    ((IMCQ | ICQ) & { _id: string })[]
  >([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(10 * 1000);
  const [examStatus, setExamStatus] = useState<
    "ready" | "started" | "finished"
  >("ready");
  const [answerScript, setAnswerScript] = useState<SingleMcqAnswerType[]>([]);
  const [scriptRes, setScriptRes] = useState<ScriptResType>({
    correct: 0,
    wrong: 0,
    obtain: 0,
    total: 0,
  });
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let qString: string = "";
    async function getAllQuestion() {
      for (const key in qDetails) {
        if (key === "questionType") continue;
        if (qDetails[key]) {
          qString += (qString ? "&" : "?") + key + "=" + qDetails[key];
        }
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/question${qString}`,
          {
            method: "POST",
            body: JSON.stringify({
              questionType: qDetails?.questionType,
              level: qDetails?.level,
            }),
            headers: {
              "Content-type": "application/json",
            },
          }
        );

        const data = await res.json();

        console.log(data);
        if (data?.success) {
          setAllQuestion(data?.data);
        }
      } catch (error) {
        console.log(error);
      }
    }

    getAllQuestion();
  }, [qDetails]);

  //
  //
  // HANDLE MCQ SUBMIT
  function handleMcqSubmit() {
    console.log("inside: ", answerScript);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
      setTimeRemaining(10 * 1000);
    }
    setExamStatus("finished");
    const obj = { ...scriptRes };
    answerScript.map((as) => {
      obj.total += as.mark;
      if (as.isCorrect) {
        obj.correct += as.mark;
        obj.obtain += as.mark;
      } else {
        obj.wrong += as.mark;
      }
    });
    setScriptRes(obj);
  }

  //
  //
  // HANDLE PRACTICE STSRT
  function handleRestart() {
    setScriptRes({ correct: 0, wrong: 0, obtain: 0, total: 0 });
    setExamStatus("ready");
  }

  const submitRef = useRef<HTMLButtonElement | null>(null);
  //
  //
  // HANDLE PRACTICE STSRT
  function handleStart() {
    setAnswerScript([]);
    setExamStatus("started");
    countdownRef.current = setInterval(() => {
      setTimeRemaining((t) => {
        if (t === 0) {
          if (submitRef?.current) {
            submitRef.current.click();
            submitRef.current = null;
          }
          return 10 * 1000;
        }
        return t - 1000;
      });
    }, 1000);
  }

  console.log(allQuestion);

  return (
    <div className="w-full space-y-8">
      {/*  */}
      {/*  */}
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

      {qDetails?.questionType ? (
        <>
          <div className="space-y-5">
            {/*  */}
            {/*  */}
            {/* SHOW RESULT */}
            {viewMode === "practice" && examStatus === "finished" && (
              <>
                <div className="grid grid-cols-2 max-md:text-sm gap-1 border-2 border-sidebar-border bg-sidebar px-4 py-4 rounded text-chart-2">
                  <div className="space-x-2">
                    <span className="font-semibold">Total</span>
                    <span>: {scriptRes?.total}</span>
                  </div>
                  <div className="space-x-2">
                    <span className="font-semibold">Correct</span>
                    <span>: {scriptRes?.correct}</span>
                  </div>
                  <div className="space-x-2">
                    <span className="font-semibold">Obtain</span>
                    <span>: {scriptRes?.obtain}</span>
                  </div>
                  <div className="space-x-2">
                    <span className="font-semibold">Wrong</span>
                    <span>: {scriptRes?.wrong}</span>
                  </div>
                </div>

                {/*  */}
                {/*  */}
                {/* RESTART BUTTON */}
                <Button className="cursor-pointer" onClick={handleRestart}>
                  Restart
                </Button>
              </>
            )}

            {/*  */}
            {/*  */}
            {/* QUESTON - MCQ */}
            {((viewMode === "practice" && examStatus !== "ready") ||
              viewMode !== "practice") && (
              <h3 className="font-bold text-xl text-center">Physics (18)</h3>
            )}
            {qDetails?.questionType === "MCQ" && (
              <>
                {allQuestion?.length > 0 &&
                  (allQuestion as (IMCQ & { _id: string })[]).map((q, i) => (
                    <div key={i}>
                      {((viewMode === "practice" && examStatus !== "ready") ||
                        viewMode === "showAns" ||
                        viewMode === "viewOnly") && (
                        <SingleMcqQuestion
                          q={q}
                          i={i + 1}
                          viewMode={viewMode}
                          setAnswerScript={setAnswerScript}
                          examStatus={examStatus}
                        />
                      )}
                    </div>
                  ))}
                {/*  */}
                {/*  */}
                {/* SUBMIT BUTTON */}
                {viewMode === "practice" && examStatus === "started" && (
                  <Button
                    ref={submitRef}
                    className="w-full cursor-pointer"
                    onClick={handleMcqSubmit}
                  >
                    Submit
                  </Button>
                )}

                {/*  */}
                {/*  */}
                {/* READY TEXTS */}
                {viewMode === "practice" && examStatus === "ready" && (
                  <div className="flex flex-col gap-2 justify-center items-center text-chart-2 font-semibold">
                    <div>Total MCQ: 25</div>
                    <div>Time: 25 mins</div>
                    <div>Total Marks: 25</div>

                    {/*  */}
                    {/*  */}
                    {/* START BUTTON */}
                    <Button className="cursor-pointer" onClick={handleStart}>
                      Start
                    </Button>
                    <br />
                    <div className="flex gap-2">
                      <MousePointerClick />
                      <span>
                        Click on{" "}
                        <span className="px-2 py-1 bg-sidebar-border text-sm rounded">
                          Start
                        </span>{" "}
                        button to start the exam.
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/*  */}
            {/*  */}
            {/* QUESTON - CQ */}
            {qDetails?.questionType === "CQ" &&
              allQuestion?.length > 0 &&
              (allQuestion as (ICQ & { _id: string })[]).map((q, i) => (
                <SingleCqQuestion key={i} q={q} i={i + 1} />
              ))}
          </div>
        </>
      ) : (
        <div className="flex gap-2 justify-center items-center text-chart-2 font-semibold">
          <TextSelect />
          <span>Select from the sidebar</span>
        </div>
      )}
    </div>
  );
}
