"use client";

import { QuestionType } from "@/app/(pages)/(services)/question-bank/[subject]/[slug]/page";
import { useState } from "react";
import SingleCqQuestion from "./single-cq-exam";

export default function SingleQuestionBank({
  slug,
  allQuestions,
}: {
  slug: string;
  allQuestions: QuestionType[];
}) {
  const [showAns, setShowAns] = useState<boolean>(false);
  console.log(slug);
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
        {allQuestions?.length > 0 &&
          allQuestions.map((q, i) => (
            // <SingleMcqQuestion q={q} i={i + 1} key={i} showAns={showAns} />
            <SingleCqQuestion q={q} i={i + 1} key={i} showAns={showAns} />
          ))}
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
