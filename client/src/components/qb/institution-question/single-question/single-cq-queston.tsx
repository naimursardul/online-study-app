import { ChevronsUpDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ICollection, ICQ } from "@/types/types";
import ReactMarkdownRender from "@/components/text-editor/ReactMarkdownRender";
import { Badge } from "@/components/ui/badge";
import { extractIdTo_ } from "@/utils/utils";
import { useMasterData } from "@/lib/MasterData-context";
import SaveToCollectionBtn from "@/components/saveToCollectionBtn/saveToCollectionBtn";

export default function SingleCqQuestion({
  q,
  i,
  collections,
  setCollections,
}: {
  q: ICQ;
  i: number;
  collections: (ICollection & { _id: string })[];
  setCollections: React.Dispatch<
    React.SetStateAction<(ICollection & { _id: string })[]>
  >;
}) {
  const { masterData } = useMasterData();

  return (
    <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-sidebar-border">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 justify-between items-start ">
          <p className="bg-input size-5 md:size-7 flex justify-center items-center px-2 py-2 text-xs rounded">
            {i}
          </p>
          <SaveToCollectionBtn
            questionId={(q as { _id: string } & ICQ)._id}
            collections={collections}
            setCollections={setCollections}
          />
        </div>
        <p className="w-full max-sm:text-sm">
          {" "}
          <ReactMarkdownRender text={q?.statement} />
        </p>
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

        {Array.isArray(q?.subQuestions) &&
          q.subQuestions.map((sq, i) => {
            const qNo: string = ["A", "B", "C", "D"][
              Number(sq?.questionNo) || 0
            ];
            return (
              <Collapsible key={i} className="border pl-3 pr-2 py-2 rounded">
                <div className="flex justify-between items-center gap-2 ">
                  <span className="font-semibold text-chart-2">{qNo}</span>
                  <p className="w-full">
                    <ReactMarkdownRender text={sq?.question} />
                  </p>
                  <CollapsibleTrigger className="cursor-pointer rounded ">
                    <ChevronsUpDown className="size-5 max-sm:size-4 hover:bg-sidebar-accent p-.5" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="px-4 py-3 max-sm:text-sm text-chart-2">
                  <ReactMarkdownRender text={sq?.answer} />
                </CollapsibleContent>
              </Collapsible>
            );
          })}
      </div>
    </div>
  );
}
