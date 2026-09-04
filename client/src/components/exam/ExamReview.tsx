import { useState } from "react";
import { Check, CheckCircle2, ChevronsUpDown, X, XCircle } from "lucide-react";
import ReactMarkdownRender from "@/components/text-editor/ReactMarkdownRender";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ExamReviewItemType } from "@/types/types";
import { optionLetterOf } from "@/utils/questionTypes";
import type { ExamResultSummary } from "./ExamResult";

type Props = {
  examName?: string;
  items: ExamReviewItemType[];
  summary: ExamResultSummary | null;
  onBack: () => void;
};

// The same bordered, tinted option rows the question display uses
// (qb/institution-question/single-question/single-mcq-question.tsx), so the
// review does not switch visual language the moment an exam is submitted.
type OptionTone = "neutral" | "correct" | "wrong";

const OPTION_TONES: Record<OptionTone, string> = {
  neutral: "border-sidebar-border",
  correct: "border-green-500 bg-green-500/10",
  wrong: "border-destructive bg-destructive/10",
};

function optionRowClass(tone: OptionTone) {
  return `flex gap-2 items-center rounded-lg border p-3 max-sm:text-sm [&_p]:my-0 ${OPTION_TONES[tone]}`;
}

const OPTION_BADGE =
  "shrink-0 size-5 md:size-6 flex items-center justify-center border border-primary rounded-full text-xs md:text-sm";

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
  const givenIdx =
    item.givenAns === undefined ||
    item.givenAns === null ||
    item.givenAns === ""
      ? null
      : Number(item.givenAns);

  const statusBadge = item.isCorrect ? (
    <Badge className="bg-green-400 gap-1">
      <Check className="size-3" /> Correct
    </Badge>
  ) : (
    <Badge variant="destructive" className="gap-1">
      <X className="size-3" />
      {givenIdx === null ? "Not answered" : "Wrong"}
    </Badge>
  );

  // The question is gone but the score it contributed is not, so the badge and the
  // marks stay and only the body is replaced.
  if (item.unavailable) {
    return (
      <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-dashed border-sidebar-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <p className="bg-input size-6 flex justify-center items-center text-xs rounded">
              {index}
            </p>
            {statusBadge}
          </div>
          <p className="text-muted-foreground text-sm max-sm:text-xs">
            This question is no longer available — it was removed after you took
            this exam. Your answer still counts towards the result above.
          </p>
        </div>
      </div>
    );
  }

  const correctIdx = Number(item.correctAnswer);

  const optionTone = (j: number): OptionTone => {
    if (j === correctIdx) return "correct";
    // Only the pick that missed is flagged; every other option stays neutral.
    if (j === givenIdx) return "wrong";
    return "neutral";
  };

  return (
    <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-sidebar-border">
      <div className="flex flex-col gap-3">
        {/* NUMBER + STATUS */}
        <div className="flex items-center gap-2">
          <p className="bg-input size-6 flex justify-center items-center text-xs rounded">
            {index}
          </p>
          {statusBadge}
        </div>

        {/* QUESTION */}
        <div className="w-full max-sm:text-sm">
          <ReactMarkdownRender text={item.question} />
        </div>

        {/* OPTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {item.options?.map((o, j) => {
            const tone = optionTone(j);

            return (
              <div key={j} className={optionRowClass(tone)}>
                <span className={OPTION_BADGE}>{optionLetterOf(j)}</span>
                <div className="min-w-0 flex-1">
                  <ReactMarkdownRender text={o} />
                </div>
                {tone === "correct" && (
                  <CheckCircle2 className="shrink-0 size-4 text-green-500" />
                )}
                {tone === "wrong" && (
                  <XCircle className="shrink-0 size-4 text-destructive" />
                )}
              </div>
            );
          })}
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
