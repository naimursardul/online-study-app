"use client";

import { useState } from "react";
import { QuestionType } from "@/app/storage/storage-type";
import SingleCqQuestion from "./single-cq-exam";
import SingleMcqQuestion from "./single-mcq-question";
import { Button } from "../ui/button";

export default function SingleQuestionBank({
  qType,
  allQuestions,
}: {
  qType: string | undefined;
  allQuestions: QuestionType[];
}) {
  const [viewMode, setViewMode] = useState<string>("viewOnly");
  const [showScriptRes, setShowScriptRes] = useState<boolean>(false);
  const [scriptRes, setScriptRes] = useState<{
    correct: number;
    wrong: number;
    obtain: number;
    total: number;
  }>({ correct: 0, wrong: 0, obtain: 0, total: 0 });
  const [answerScript, setAnswerScript] = useState<
    {
      id: string;
      givenAns: string | undefined;
      mark: number;
      isCorrect: boolean;
    }[]
  >([]);

  function handleMcqSumit() {
    setShowScriptRes(true);
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
  console.log(answerScript);
  console.log(viewMode);

  return (
    <div className="w-full space-y-8">
      <div className="flex gap-4 justify-between items-center bg-background rounded sticky top-0 p-3 border-b-2 border-border ">
        <div>
          <h3 className="font-semibold">Engineering admission-2024</h3>
          <p className="text-xs text-chart-2 font-semibold">
            Engineering Weekly(MCQ) - 1
          </p>
        </div>
        <form
          onChange={(e) => setViewMode(e.target?.value)}
          className="flex flex-col gap-1"
        >
          <select
            name="viewMode"
            id="viewMode"
            className="border-none outline-none bg-sidebar-accent pl-2 py-2 rounded text-xs md:text-sm font-semibold cursor-pointer"
          >
            <option value="viewOnly" defaultChecked>
              View Only
            </option>
            <option value="showAns">Show Answer</option>
            <option value="practice">Practice</option>
          </select>
        </form>
      </div>
      {qType ? (
        <>
          <div className="space-y-5">
            {showScriptRes && (
              <div>
                <div>
                  <span>Total:</span>
                  <span>{scriptRes?.total}</span>
                </div>
                <div>
                  <span>Obtain:</span>
                  <span>{scriptRes?.obtain}</span>
                </div>
                <div>
                  <span>Correct:</span>
                  <span>{scriptRes?.correct}</span>
                </div>
                <div>
                  <span>Wrong:</span>
                  <span>{scriptRes?.wrong}</span>
                </div>
              </div>
            )}
            <h3 className="font-bold text-xl text-center">Physics (18)</h3>
            {qType === "mcq" && (
              <>
                {allQuestions?.length > 0 &&
                  allQuestions.map((q, i) => (
                    <SingleMcqQuestion
                      q={q}
                      i={i + 1}
                      key={i}
                      viewMode={viewMode}
                      setAnswerScript={setAnswerScript}
                      showScriptRes={showScriptRes}
                    />
                  ))}
                {viewMode === "practice" && (
                  <Button className="w-full" onClick={handleMcqSumit}>
                    Submit
                  </Button>
                )}
              </>
            )}
            {qType === "cq" && <SingleCqQuestion />}
          </div>
          <div className="space-y-5">
            <h3 className="w-full font-bold text-xl text-center">Math (18)</h3>
          </div>
          <div className="space-y-5">
            <h3 className="w-full font-bold text-xl text-center">
              Chemistry (18)
            </h3>
          </div>
        </>
      ) : (
        <div>Select from the sidebar</div>
      )}
    </div>
  );
}
