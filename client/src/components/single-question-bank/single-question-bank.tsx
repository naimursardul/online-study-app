"use client";

import { useState } from "react";
import { QuestionType } from "@/app/storage/storage-type";
import SingleCqQuestion from "./single-cq-exam";
import SingleMcqQuestion from "./single-mcq-question";

export default function SingleQuestionBank({
  qType,
  allQuestions,
}: {
  qType: string;
  allQuestions: QuestionType[];
}) {
  const [showAns, setShowAns] = useState<boolean>(false);

  return (
    <div className="w-full space-y-8">
      <div className="flex gap-4 justify-between items-center bg-background rounded sticky top-0 p-3 border-b-2 border-border ">
        <div>
          <h3 className="font-semibold">Engineering admission-2024</h3>
          <p className="text-xs text-chart-2 font-semibold">
            Engineering Weekly(MCQ) - 1
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <label htmlFor="showAns" className="text-xs md:text-sm font-semibold">
            Show Answer
          </label>
          <input
            onChange={(e) => setShowAns(e.target.checked)}
            type="checkbox"
            name="showAns"
            className="size-4 cursor-pointer"
          />
        </div>
      </div>
      <div className="space-y-5">
        <h3 className="font-bold text-xl text-center">Physics (18)</h3>
        {qType === "mcq" &&
          allQuestions?.length > 0 &&
          allQuestions.map((q, i) => (
            <SingleMcqQuestion q={q} i={i + 1} key={i} showAns={showAns} />
          ))}
        {qType === "cq" && <SingleCqQuestion />}
      </div>
      <div className="space-y-5">
        <h3 className="w-full font-bold text-xl text-center">Math (18)</h3>
      </div>
      <div className="space-y-5">
        <h3 className="w-full font-bold text-xl text-center">Chemistry (18)</h3>
      </div>
    </div>
  );
}
