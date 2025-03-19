"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Bookmark, BookmarkCheck, ChevronsUpDown, X } from "lucide-react";
import { Button } from "../ui/button";
import { QuestionType } from "@/app/storage/storage-type";

export default function SingleMcqQuestion({
  q,
  i,
  viewMode,
  setAnswerScript,
  showScriptRes,
}: {
  q: QuestionType;
  i: number;
  viewMode: string;
  showScriptRes: boolean;
  setAnswerScript: Dispatch<
    SetStateAction<
      {
        id: string;
        givenAns: string | undefined;
        mark: number;
        isCorrect: boolean;
      }[]
    >
  >;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const optionSetting: Record<number, string> = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
  };

  const [isMarked, setIsMarked] = useState<boolean>(false);
  const [changeOption, setChangeOption] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<{
    id: string;
    givenAns: string | undefined;
  }>();

  useEffect(() => {
    setAnswerScript((p) => {
      const findQ = p.find((t) => t.id === q._id);
      if (findQ) {
        return p;
      }
      return [
        ...p,
        { id: q._id, givenAns: undefined, mark: q.mark, isCorrect: false },
      ];
    });
  }, []);

  function handleScript(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    setSelectedOption({ id: q._id, givenAns: e.target.value });
    setChangeOption(false);

    setAnswerScript((p) => {
      const isCorrect = e.target.value === q.answer;
      const newP = p.map((t) => {
        if (t.id === q._id) {
          t.givenAns = e.target.value;
          t.isCorrect = isCorrect;
        }
        return t;
      });

      return [...newP];
    });
  }
  console.log(selectedOption);

  const optionBg = (o: string) => {
    if (showScriptRes) {
      if (o === q.answer) {
        return "bg-green-500 text-white";
      }

      if (
        selectedOption?.givenAns === o &&
        selectedOption?.givenAns !== q.answer
      ) {
        return "bg-red-500 text-white";
      }
    }

    if (selectedOption?.givenAns === o) {
      return "bg-green-500 text-white";
    }
    return "bg-sidebar-accent";
  };

  const optionRefs = useRef<(HTMLInputElement | null)[]>([]);
  return (
    <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-sidebar-border">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 justify-between items-start ">
          <div className="flex gap-2">
            <p className="bg-input size-5 md:size-7 flex justify-center items-center px-2 py-2 text-xs rounded">
              {i}
            </p>
            {viewMode === "practice" &&
              showScriptRes &&
              selectedOption?.givenAns !== q.answer && (
                <X className="text-red-700 " />
              )}
          </div>
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
        <p className="w-full max-sm:text-sm">{q?.detail[0]}</p>
        {q?.record?.length > 0 && (
          <div className="flex justify-end ">
            <p className="bg-sidebar-accent px-2 py-2 text-chart-2 text-xs max-sm:text-[11px] font-bold rounded">
              {q.tag.join(", ")}
            </p>
          </div>
        )}
        {viewMode === "practice" ? (
          <form
            onChange={handleScript}
            className="grid grid-cols-1 sm:grid-cols-2 gap-1 "
          >
            {q?.options?.length &&
              q.options.map((o, j) => (
                <div
                  key={j}
                  onClick={() => optionRefs.current[j]?.click()}
                  className={`flex gap-2 items-center px-2 py-2 rounded-lg cursor-pointer ${optionBg(
                    o
                  )}`}
                >
                  <div
                    className={`min-w-4 min-h-4 md:min-w-5 md:min-h-5 flex items-center justify-center border-1 border-primary rounded-full text-xs md:text-sm ${
                      selectedOption?.givenAns === o ||
                      (showScriptRes && q?.answer === o)
                        ? "border-white"
                        : "border-primary"
                    }`}
                  >
                    {optionSetting[j]}
                  </div>
                  <input
                    hidden
                    ref={(el) => {
                      optionRefs.current[j] = el;
                    }}
                    disabled={!changeOption || showScriptRes}
                    type="radio"
                    name="mcq"
                    id="mcq"
                    value={o}
                  />
                  <p className="max-sm:text-sm ">{o}</p>
                </div>
              ))}
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 ">
            {q?.options?.length &&
              q.options.map((o, j) => (
                <div
                  key={j}
                  className={`flex gap-2 items-center px-2 py-2 rounded-lg  ${
                    viewMode === "showAns" && q?.answer === o
                      ? "bg-green-500 text-white border-none"
                      : "bg-sidebar-accent"
                  }`}
                >
                  <div
                    className={`min-w-4 min-h-4 md:min-w-5 md:min-h-5 flex items-center justify-center border-1  ${
                      viewMode === "showAns" && q?.answer === o
                        ? "border-white"
                        : "border-primary"
                    } rounded-full text-xs md:text-sm`}
                  >
                    {optionSetting[j]}
                  </div>
                  <p className="max-sm:text-sm ">{o}</p>
                </div>
              ))}
          </div>
        )}

        {viewMode === "showAns" && (
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
        )}
      </div>
    </div>
  );
}
