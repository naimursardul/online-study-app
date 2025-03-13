"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { QuestionType } from "@/app/(pages)/(services)/question-bank/[slug]/page";

export default function SingleQuestion({
  q,
  i,
  showAns,
}: {
  q: QuestionType;
  i: number;
  showAns: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const optionSetting: Record<number, string> = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
  };

  return (
    <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-sidebar-border">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 justify-start ">
          <p className="bg-input h-7 px-2 py-2 text-xs rounded">{i}</p>
          <p className="max-sm:text-sm">{q?.detail}</p>
        </div>

        {q?.tag?.length > 0 && (
          <div className="flex justify-end ">
            <p className="bg-sidebar-accent px-2 py-2 text-chart-2 text-xs max-sm:text-[11px] font-bold rounded">
              {q.tag.join(", ")}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-sm:text-sm ">
          {q?.options?.length &&
            q.options.map((o, j) => (
              <div
                key={j}
                className="flex gap-2 items-center bg-sidebar-accent px-2 py-2 rounded-lg"
              >
                <div
                  className={`min-w-4 min-h-4 md:min-w-5 md:min-h-5 flex items-center justify-center border-1 border-primary ${
                    showAns &&
                    q?.answer === o &&
                    "bg-destructive text-white border-none"
                  } rounded-full text-xs md:text-sm`}
                >
                  {optionSetting[j]}
                </div>
                <p>{o}</p>
              </div>
            ))}
        </div>

        {/* <Button className="w-full">Show Explanation</Button> */}
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="bg-chart-6 rounded-2xl"
        >
          <CollapsibleTrigger className="w-full flex items-center justify-center gap-1 bg-chart-6 shadow-2xl py-[10px] rounded-2xl font-semibold text-sm max-sm:text-xs hover:opacity-75 cursor-pointer">
            {isOpen ? "Hide Explanation" : "Show Explanation"}
            <ChevronsUpDown className="size-4 max-sm:size-3" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 py-3 max-sm:text-sm ">
            {q?.explanation}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
