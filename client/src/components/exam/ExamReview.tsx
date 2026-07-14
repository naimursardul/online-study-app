import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import ReactMarkdownRender from "@/components/text-editor/ReactMarkdownRender";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ExamReviewItemType } from "@/types/types";
import type { ExamResultSummary } from "./ExamResult";

type Props = {
  examName?: string;
  items: ExamReviewItemType[];
  summary: ExamResultSummary | null;
  onBack: () => void;
};

const OPTION_LABEL: Record<number, string> = { 0: "A", 1: "B", 2: "C", 3: "D" };

export default function ExamReview({
  examName,
  items,
  summary,
  onBack,
}: Props) {
  return (
    <div className="space-y-5">
      {/* HEADER + SUMMARY */}
      <div className="rounded-2xl border border-sidebar-border bg-background p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-lg font-semibold">{examName} — Review</h1>
          <Button variant="secondary" size="sm" onClick={onBack}>
            Back to exams
          </Button>
        </div>
        {summary && (
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <span className="text-chart-2 font-medium">
              {summary.percentage}%
            </span>
            <span>Correct: {summary.correctCount}</span>
            <span>Wrong: {summary.wrongCount}</span>
            <span>
              Marks: {summary.obtainedMarks}/{summary.totalMarks}
            </span>
          </div>
        )}
      </div>

      {/* QUESTIONS */}
      {items.map((item, i) => (
        <ReviewQuestion key={item.questionId} item={item} index={i + 1} />
      ))}
    </div>
  );
}

function ReviewQuestion({
  item,
  index,
}: {
  item: ExamReviewItemType;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const correctIdx = Number(item.correctAnswer);
  const givenIdx =
    item.givenAns === undefined || item.givenAns === null
      ? null
      : Number(item.givenAns);

  const optionBg = (j: number) => {
    if (j === correctIdx) return "bg-green-400 text-white border-none";
    if (givenIdx === j && givenIdx !== correctIdx)
      return "bg-red-500 text-white border-none";
    return "bg-sidebar-accent";
  };

  return (
    <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-sidebar-border">
      <div className="flex flex-col gap-3">
        {/* NUMBER + STATUS */}
        <div className="flex items-center gap-2">
          <p className="bg-input size-6 flex justify-center items-center text-xs rounded">
            {index}
          </p>
          {item.isCorrect ? (
            <Badge className="bg-green-400 gap-1">
              <Check className="size-3" /> Correct
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <X className="size-3" />
              {givenIdx === null ? "Not answered" : "Wrong"}
            </Badge>
          )}
        </div>

        {/* QUESTION */}
        <div className="w-full max-sm:text-sm">
          <ReactMarkdownRender text={item.question} />
        </div>

        {/* OPTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {item.options?.map((o, j) => (
            <div
              key={j}
              className={`pl-4 flex gap-2 items-center px-2 py-2 rounded-lg font-semibold ${optionBg(
                j,
              )}`}
            >
              <span className="size-5 flex items-center justify-center border border-primary rounded-full text-xs md:text-sm text-primary">
                {OPTION_LABEL[j]}
              </span>
              <span className="max-sm:text-sm">
                <ReactMarkdownRender text={o} />
              </span>
            </div>
          ))}
        </div>

        {/* EXPLANATION */}
        {item.explanation && (
          <Collapsible
            open={open}
            onOpenChange={setOpen}
            className="bg-chart-6 rounded-2xl"
          >
            <CollapsibleTrigger className="w-full flex items-center justify-center gap-1 bg-chart-6 shadow-2xl py-2.5 rounded-2xl font-semibold text-sm max-sm:text-xs hover:opacity-75 cursor-pointer">
              {open ? "Hide Explanation" : "Show Explanation"}
              <ChevronsUpDown className="size-4 max-sm:size-3" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 py-3 max-sm:text-sm">
              <ReactMarkdownRender text={item.explanation} />
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
