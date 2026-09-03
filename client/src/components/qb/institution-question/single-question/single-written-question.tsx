import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { IWritten } from "@/types/types";
import ReactMarkdownRender from "@/components/text-editor/ReactMarkdownRender";
import { Badge } from "@/components/ui/badge";
import { extractIdTo_ } from "@/utils/utils";
import { useMasterData } from "@/lib/MasterData-context";
import SaveToCollectionButton from "@/components/collection/saveToCollectionBtn";
import { labelOf } from "@/utils/questionTypes";

// The `simple` family (SQ / EQ / WQ): question on top, answer behind a toggle.
export default function SingleWrittenQuestion({
  q,
  i,
  showTypeBadge,
}: {
  q: IWritten & { _id: string };
  i: number;
  // Collections mix question types, so they label each card.
  showTypeBadge?: boolean;
}) {
  const { masterData } = useMasterData();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-sidebar-border">
      <div className="flex flex-col gap-3">
        {/* NUMBERING + BOOKMARK BUTTON */}
        <div className="flex gap-3 justify-between items-start">
          <p className="bg-input size-5 md:size-7 flex justify-center items-center px-2 py-2 text-xs rounded">
            {i}
          </p>
          <SaveToCollectionButton
            questionType={q.questionType}
            questionId={q._id}
            subjectId={q.subjectId}
            chapterId={q.chapterId}
            topicId={q.topicId}
          />
        </div>

        {/* QUESTION */}
        <div className="w-full max-sm:text-sm">
          <ReactMarkdownRender text={q?.question} />
        </div>

        {/* RECORDS + META */}
        <div className="flex flex-col items-end gap-2">
          {q?.record?.length > 0 && (
            <Badge variant="secondary">
              {Array.isArray(q?.record) &&
                q.record.map((r) => `${r.institution}-${r.year}`).join(", ")}
            </Badge>
          )}
          <div className="flex gap-2 flex-wrap justify-end">
            {showTypeBadge && (
              <Badge variant="secondary">{labelOf(q.questionType)}</Badge>
            )}
            <Badge variant="secondary">
              {extractIdTo_(masterData.chapters, q.chapterId, "name")} -{" "}
              {extractIdTo_(masterData.topics, q.topicId, "name")}
            </Badge>
            <Badge variant="secondary">{q.difficulty}</Badge>
          </div>
        </div>

        {/* ANSWER */}
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="bg-chart-6 rounded-2xl"
        >
          <CollapsibleTrigger className="w-full flex items-center justify-center gap-1 bg-chart-6 shadow-2xl py-2.5 rounded-2xl font-semibold text-sm max-sm:text-xs hover:opacity-75 cursor-pointer">
            {isOpen ? "Hide Answer" : "Show Answer"}
            <ChevronsUpDown className="size-4 max-sm:size-3" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 py-3 max-sm:text-sm">
            <ReactMarkdownRender text={q?.answer} />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
