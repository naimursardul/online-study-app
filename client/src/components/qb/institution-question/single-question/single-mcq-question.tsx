import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { ChevronsUpDown, X } from "lucide-react";
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
  const optionRefs = useRef<(HTMLInputElement | null)[]>([]);

  // COLLAPSE SETTING FOR EXPLATION
  const [isOpen, setIsOpen] = useState(false);

  // CONVERT OPTION INDEX TO STRING
  const optionSetting: Record<number, string> = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
  };

  // HANDLE AFTER SELECTING AN OPTION
  function handleSingleMcqSubmit(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!setAnswerScript) return;
    const singleAnsObj: SingleMcqAnswerType = {
      questionId: q._id,
      givenAns: e.target.value,
    };
    setSingleMcqAnswer(singleAnsObj);
    setChangeOption(false);

    // setting answer to answer script array
    setAnswerScript((p) => {
      const newP = p.map((t) => {
        if (t.questionId === singleAnsObj.questionId) {
          t = { ...singleAnsObj };
        }
        return t;
      });

      return [...newP];
    });
  }

  const optionBg = (optionNumber: string) => {
    if (optionNumber === singleMcqAnswer.givenAns) {
      return "bg-green-400";
    }
    return "bg-sidebar-accent";
  };

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
          <SaveToCollectionButton
            questionId={q._id}
            subjectId={q.subjectId}
            chapterId={q.chapterId}
            topicId={q.topicId}
            questionType={q.questionType}
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
          <>
            {/* MCQ FORM */}
            <form
              onChange={handleSingleMcqSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-1 "
            >
              {q?.options?.length &&
                q.options.map((o, j) => (
                  <div
                    key={j}
                    onClick={() => optionRefs.current[j]?.click()}
                    className={`flex gap-2 items-center px-2 py-2 rounded-lg cursor-pointer ${optionBg(
                      String(j),
                    )}`}
                  >
                    {/* OPTION NUMBERING */}
                    <div
                      className={`min-w-4 min-h-4 md:min-w-5 md:min-h-5 flex items-center justify-center border border-primary rounded-full text-xs md:text-sm`}
                    >
                      {optionSetting[j]}
                    </div>
                    {/* OPTION INPUT */}
                    <input
                      hidden
                      ref={(el) => {
                        optionRefs.current[j] = el;
                      }}
                      disabled={!changeOption || examStatus === "finished"}
                      type="radio"
                      name={`mcq-${q._id}`}
                      id={`mcq-${q._id}-${j}`}
                      value={String(j)}
                    />
                    {/* OPTION DETAILS */}
                    <p className="max-sm:text-sm ">{o}</p>
                  </div>
                ))}
            </form>
          </>
        ) : (
          // MCQ (VIEW ONLY + SHOW ANSWER MODE)
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
            {q?.options?.length &&
              q.options.map((o, j) => (
                <div
                  key={j}
                  className={` flex gap-2 items-center px-2 py-2 rounded-lg font-semibold  ${
                    viewMode === "showAns" && q?.correctAnswer === String(j)
                      ? "bg-green-400 border-none"
                      : "bg-sidebar-accent"
                  }`}
                >
                  {/* OPTION NUMBERING */}
                  <span
                    className={`min-w-4 min-h-4 md:min-w-5 md:min-h-5 flex items-center justify-center border border-primary rounded-full text-xs md:text-sm`}
                  >
                    {optionSetting[j]}
                  </span>
                  {/* OPTION DETAILS */}
                  <span
                    className={`flex justify-center items-center max-sm:text-sm `}
                  >
                    <ReactMarkdownRender text={o} />
                  </span>
                </div>
              ))}
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
