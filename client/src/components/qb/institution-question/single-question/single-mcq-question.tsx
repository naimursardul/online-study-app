import { useState, type Dispatch, type SetStateAction } from "react";
import { CheckCircle2, ChevronsUpDown } from "lucide-react";
import type {
  ExamStatusType,
  IMCQ,
  SingleMcqAnswerType,
  ViewModeType,
} from "@/types/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ReactMarkdownRender from "@/components/text-editor/ReactMarkdownRender";
import { Badge } from "@/components/ui/badge";
import { useMasterData } from "@/lib/MasterData-context";
import { extractIdTo_ } from "@/utils/utils";
import SaveToCollectionButton from "@/components/collection/saveToCollectionBtn";
import { optionLetterOf } from "@/utils/questionTypes";
import ProtectedComponent from "@/lib/Protected.component";

// Options are bordered boxes tinted by state — the same design the admin's
// extraction card uses (admin/questionExtraction/MCQCard.tsx), so an option
// looks the same whether it is being authored or answered. Green means "this is
// the answer", so a practice pick is tinted with the primary colour instead:
// nothing has been graded at that point.
type OptionTone = "neutral" | "correct" | "picked";

const OPTION_TONES: Record<OptionTone, string> = {
  neutral: "border-sidebar-border",
  correct: "border-green-500 bg-green-500/10",
  picked: "border-primary bg-primary/10",
};

// `[&_p]:my-0` cancels the `my-2` ReactMarkdownRender puts on paragraphs, which
// would otherwise inflate every row.
function optionRowClass(tone: OptionTone, selectable = false) {
  return `flex gap-2 items-center rounded-lg border p-3 max-sm:text-sm [&_p]:my-0 ${
    OPTION_TONES[tone]
  } ${selectable ? "cursor-pointer hover:border-primary/60" : ""}`;
}

const OPTION_BADGE =
  "shrink-0 size-5 md:size-6 flex items-center justify-center border border-primary rounded-full text-xs md:text-sm";

export default function SingleMcqQuestion({
  q,
  i,
  viewMode,
  setAnswerScript,
  examStatus,
}: {
  q: IMCQ & { _id: string };
  i: number;
  viewMode: ViewModeType;
  examStatus?: ExamStatusType;
  setAnswerScript?: Dispatch<SetStateAction<SingleMcqAnswerType[]>>;
}) {
  const { masterData } = useMasterData();
  const [changeOption, setChangeOption] = useState<boolean>(true);
  const [singleMcqAnswer, setSingleMcqAnswer] = useState<SingleMcqAnswerType>({
    questionId: q._id || "",
    givenAns: undefined,
  });

  // COLLAPSE SETTING FOR EXPLATION
  const [isOpen, setIsOpen] = useState(false);

  // A question can reach here carrying no options at all, and the rendering must
  // not leak a stray `0` for it.
  const hasOptions = Array.isArray(q?.options) && q.options.length > 0;

  // Practice locks after the first pick, and a finished exam locks everything.
  const canPick = changeOption && examStatus !== "finished";

  // HANDLE AFTER SELECTING AN OPTION
  function handleOptionChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!setAnswerScript) return;
    const singleAnsObj: SingleMcqAnswerType = {
      questionId: q._id,
      givenAns: e.target.value,
    };
    setSingleMcqAnswer(singleAnsObj);
    setChangeOption(false);

    // setting answer to answer script array
    setAnswerScript((p) =>
      p.map((t) =>
        t.questionId === singleAnsObj.questionId ? { ...singleAnsObj } : t,
      ),
    );
  }

  return (
    <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-sidebar-border">
      <div className="flex flex-col gap-3">
        {/* NUMBERING + BOOKMARK BUTTON */}
        <div className="flex gap-3 justify-between items-start ">
          {/* NUMBERING */}
          <p className="bg-input size-5 md:size-7 flex justify-center items-center px-2 py-2 text-xs rounded">
            {i}
          </p>
          {/* BOOKMARK BUTTON */}
          <ProtectedComponent
            component={
              <SaveToCollectionButton
                questionId={q._id}
                subjectId={q.subjectId}
                chapterId={q.chapterId}
                topicId={q.topicId}
                questionType={q.questionType}
              />
            }
          />
        </div>
        {/* QUESTION DETAILS */}
        <div className="w-full max-sm:text-sm">
          <ReactMarkdownRender text={q?.question} />
        </div>
        {/* RECORDS */}
        <div className="flex flex-col items-end gap-2">
          {q?.record?.length > 0 && (
            <Badge variant="secondary">
              {Array.isArray(q?.record) &&
                q.record.map((r) => `${r.institution}-${r.year}`).join(", ")}
            </Badge>
          )}
          <div className="flex gap-2">
            <Badge variant="secondary">
              {extractIdTo_(masterData.chapters, q.chapterId, "name")} -{" "}
              {extractIdTo_(masterData.topics, q.topicId, "name")}
            </Badge>
            <Badge variant="secondary">{q.difficulty}</Badge>
          </div>
        </div>

        {viewMode === "practice" ? (
          /* PRACTICE / EXAM — a real radio group, so Tab reaches it and the
             arrow keys move through the options. */
          <fieldset
            disabled={!canPick}
            className="grid min-w-0 grid-cols-1 sm:grid-cols-2 gap-2"
          >
            <legend className="sr-only">Options for question {i}</legend>
            {hasOptions
              ? q.options.map((o, j) => (
                  <label
                    key={j}
                    htmlFor={`mcq-${q._id}-${j}`}
                    className={`${optionRowClass(
                      singleMcqAnswer.givenAns === String(j)
                        ? "picked"
                        : "neutral",
                      canPick,
                    )} has-focus-visible:ring-2 has-focus-visible:ring-ring/50`}
                  >
                    {/* OPTION NUMBERING */}
                    <span className={OPTION_BADGE}>{optionLetterOf(j)}</span>
                    {/* OPTION INPUT — visually hidden but still focusable, and
                        the option text becomes its accessible name. */}
                    <input
                      className="sr-only"
                      type="radio"
                      name={`mcq-${q._id}`}
                      id={`mcq-${q._id}-${j}`}
                      value={String(j)}
                      checked={singleMcqAnswer.givenAns === String(j)}
                      onChange={handleOptionChange}
                    />
                    {/* OPTION DETAILS */}
                    <div className="min-w-0 flex-1">
                      <ReactMarkdownRender text={o} />
                    </div>
                  </label>
                ))
              : null}
          </fieldset>
        ) : (
          // MCQ (VIEW ONLY + SHOW ANSWER MODE)
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {hasOptions
              ? q.options.map((o, j) => {
                  const isCorrect =
                    viewMode === "showAns" && q?.correctAnswer === String(j);

                  return (
                    <div
                      key={j}
                      className={optionRowClass(
                        isCorrect ? "correct" : "neutral",
                      )}
                    >
                      {/* OPTION NUMBERING */}
                      <span className={OPTION_BADGE}>{optionLetterOf(j)}</span>
                      {/* OPTION DETAILS */}
                      <div className="min-w-0 flex-1">
                        <ReactMarkdownRender text={o} />
                      </div>
                      {isCorrect && (
                        <CheckCircle2 className="shrink-0 size-4 text-green-500" />
                      )}
                    </div>
                  );
                })
              : null}
          </div>
        )}
        {/* MCQ EXPLANATION */}
        {viewMode === "showAns" && (
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="bg-chart-6 rounded-2xl"
          >
            <CollapsibleTrigger className="w-full flex items-center justify-center gap-1 bg-chart-6 shadow-2xl py-2.5 rounded-2xl font-semibold text-sm max-sm:text-xs hover:opacity-75 cursor-pointer">
              {isOpen ? "Hide Explanation" : "Show Explanation"}
              <ChevronsUpDown className="size-4 max-sm:size-3" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 py-3 max-sm:text-sm ">
              <ReactMarkdownRender text={q?.explanation} />
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
