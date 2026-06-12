import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo } from "react";
import { useMasterData } from "@/lib/MasterData-context";
import ReactMarkdownRender from "../../text-editor/ReactMarkdownRender";
import TextEditor from "../../text-editor/TextEditor";
import type { ICQWithMeta, ISubQuestionWithMeta } from "@/types/types";
import QuestionMetaSection from "./QuestionMetaSection";
import ValidationSummary from "./ValidationSummary ";
import type { IQuestionValidationResult } from "@/utils/validateQuestion";
import { extractIdTo_ } from "@/utils/utils";

interface CQCardProps {
  question: ICQWithMeta;
  editMode: boolean;
  onChange: (updated: ICQWithMeta) => void;
  validationResult: IQuestionValidationResult;
}

const SUB_QUESTION_LABELS = ["A", "B", "C", "D"];

export default function CQCard({
  question,
  editMode,
  onChange,
  validationResult,
}: CQCardProps) {
  const { masterData } = useMasterData();

  // Chapter options driven by parent subjectId
  const chapterOptions = useMemo(
    () =>
      masterData.chapters.filter((ch) => ch.subjectId === question.subjectId),
    [masterData.chapters, question.subjectId],
  );

  // Per-subquestion topic options driven by each sq's chapterId
  const topicOptionsMap = useMemo(
    () =>
      question.subQuestions.map((sq) =>
        masterData.topics.filter((topic) => topic.chapterId === sq.chapterId),
      ),
    [masterData.topics, question.subQuestions],
  );

  function handleStatement(val: string) {
    onChange({ ...question, statement: val });
  }

  function handleSubQuestion(
    index: number,
    field: keyof ISubQuestionWithMeta,
    value: string,
  ) {
    const updated = question.subQuestions.map((sq, i) =>
      i === index
        ? {
            ...sq,
            [field]: value,
            // reset topicId when chapter changes
            ...(field === "chapterId" && { topicId: "" }),
          }
        : sq,
    );
    onChange({ ...question, subQuestions: updated });
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Statement */}
      <div className="space-y-2">
        <Label>উদ্দীপক</Label>
        {editMode ? (
          <TextEditor value={question.statement} onChangeFn={handleStatement} />
        ) : (
          <ReactMarkdownRender text={question.statement} />
        )}
      </div>
      {/* Sub Questions */}
      <div className="space-y-6">
        <Label>Sub Questions</Label>

        {question.subQuestions.map((sq, i) => (
          <Card key={i} className="p-4 space-y-4">
            {/* Sub question label */}
            <Label>
              Question No:{" "}
              <span className="font-bold bg-accent-foreground text-accent p-1 rounded">
                {SUB_QUESTION_LABELS[i] ?? sq.questionNo}
              </span>
            </Label>

            {editMode && (
              <>
                {/* Chapter */}
                <div className="space-y-2">
                  <Label className="font-light">Chapter</Label>
                  <Select
                    value={sq.chapterId || ""}
                    onValueChange={(val) =>
                      handleSubQuestion(i, "chapterId", val)
                    }
                    disabled={!question.subjectId}
                  >
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Select chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {chapterOptions.length > 0 ? (
                          chapterOptions.map((ch) => (
                            <SelectItem
                              key={ch._id}
                              value={ch._id}
                              className="cursor-pointer"
                            >
                              {ch.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="no-data">
                            No chapters available.
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Topic */}
                <div className="space-y-2">
                  <Label className="font-light">Topic</Label>
                  <Select
                    value={sq.topicId || ""}
                    onValueChange={(val) =>
                      handleSubQuestion(i, "topicId", val)
                    }
                    disabled={topicOptionsMap[i]?.length === 0}
                  >
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {topicOptionsMap[i]?.length > 0 ? (
                          topicOptionsMap[i].map((topic) => (
                            <SelectItem
                              key={topic._id}
                              value={topic._id}
                              className="cursor-pointer"
                            >
                              {topic.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="no-data">
                            No topics available.
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Question */}
            <div className="space-y-2">
              <Label className="font-light">Question</Label>
              {editMode ? (
                <TextEditor
                  value={sq.question}
                  onChangeFn={(val) => handleSubQuestion(i, "question", val)}
                />
              ) : (
                <ReactMarkdownRender text={sq.question} />
              )}
            </div>

            {/* Answer */}
            <div className="space-y-2">
              <Label className="font-light">Answer</Label>
              {editMode ? (
                <TextEditor
                  value={sq.answer}
                  onChangeFn={(val) => handleSubQuestion(i, "answer", val)}
                />
              ) : (
                <ReactMarkdownRender text={sq.answer} />
              )}
            </div>

            {/* Per-subquestion metadata badges — read mode */}
            {!editMode && (sq.chapterId || sq.topicId) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {sq.chapterId && (
                  <Badge variant="secondary">
                    Chapter:{" "}
                    {extractIdTo_(masterData.chapters, sq.chapterId, "name")}
                  </Badge>
                )}
                {sq.topicId && (
                  <Badge variant="secondary">
                    Topic: {extractIdTo_(masterData.topics, sq.topicId, "name")}
                  </Badge>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
      <QuestionMetaSection
        meta={question}
        onChange={(updated) =>
          onChange({
            ...question,
            ...updated,
            questionType: "CQ",
            statement: question.statement,
            subQuestions: question.subQuestions,
          })
        }
        editMode={editMode}
      />
      <ValidationSummary result={validationResult} />
    </Card>
  );
}
