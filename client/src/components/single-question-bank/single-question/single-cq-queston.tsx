"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";
import { Bookmark, BookmarkCheck, ChevronsUpDown } from "lucide-react";
import { Button } from "../../ui/button";
import { ICQ } from "@/lib/type";

export default function SingleCqQuestion({ q, i }: { q: ICQ; i: number }) {
  const [isMarked, setIsMarked] = useState<boolean>(false);

  return (
    <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-sidebar-border">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 justify-between items-start ">
          <p className="bg-input size-5 md:size-7 flex justify-center items-center px-2 py-2 text-xs rounded">
            {i}
          </p>
          <Button
            onClick={() => setIsMarked(!isMarked)}
            variant={"ghost"}
            size={"icon"}
            className="cursor-pointer"
          >
            {isMarked ? (
              <BookmarkCheck className="text-destructive" />
            ) : (
              <Bookmark />
            )}
          </Button>
        </div>
        <p className="w-full max-sm:text-sm">{q?.statement}</p>
        <div className="flex justify-end ">
          <p className="bg-sidebar-accent px-2 py-2 text-chart-2 text-xs max-sm:text-[11px] font-bold rounded">
            {Array.isArray(q?.record) &&
              q.record.map((r) => `${r.institution}-${r.year}`).join(", ")}
          </p>
        </div>

        {Array.isArray(q?.subQuestions) &&
          q.subQuestions.map((sq, i) => (
            <Collapsible key={i} className="border-1 pl-3 pr-2 py-2 rounded">
              <div className="flex justify-between gap-2 ">
                <span className="font-semibold text-chart-2">
                  {sq?.questionNo}
                </span>
                <p className="w-full">{sq?.question}</p>
                <CollapsibleTrigger className="cursor-pointer rounded ">
                  <ChevronsUpDown className="size-5 max-sm:size-4 hover:bg-sidebar-accent p-[2px]" />
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="px-4 py-3 max-sm:text-sm text-chart-2">
                {sq?.answer}
              </CollapsibleContent>
            </Collapsible>
          ))}
      </div>
    </div>
  );
}
