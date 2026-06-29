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
import type { ICQ } from "@/types/types";
import QuestionMetaSection from "./QuestionMetaSection";
import ValidationSummary from "./ValidationSummary ";
import type { IQuestionValidationResult } from "@/utils/validateQuestion";
import { extractIdTo_ } from "@/utils/utils";

interface CQCardProps {
  setQuestions: React.Dispatch<React.SetStateAction<ICQ[]>>;
  index: number;
  isQuestionReady: boolean;
  setIsQuestionReady: React.Dispatch<React.SetStateAction<boolean>>;
  question: ICQ;
  editMode: boolean;
  validationResult: IQuestionValidationResult;
}

const SUB_QUESTION_LABELS = ["A", "B", "C", "D"];

export default function CQCard({
  setQuestions,
  index,
  isQuestionReady,
  setIsQuestionReady,
  question,
  editMode,
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

  return (
    <Card className="p-6 space-y-6">
      {/* Statement */}
      <div className="space-y-2">
        <Label>উদ্দীপক</Label>
        {editMode ? (
          <TextEditor
            isFinished={isQuestionReady}
            setIsFinished={setIsQuestionReady}
            value={question.statement}
            onChangeFn={(val) =>
              setQuestions((prev) => {
                prev[index].statement = val;
                return [...prev];
              })
            }
          />
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
                      setQuestions((prev) => {
                        prev[index].chapterId = val;
                        return [...prev];
                      })
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
                      setQuestions((prev) => {
                        prev[index].levelId = val;
                        return [...prev];
                      })
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
                  isFinished={isQuestionReady}
                  setIsFinished={setIsQuestionReady}
                  value={sq.question}
                  onChangeFn={(val) =>
                    setQuestions((prev) => {
                      prev[index].subQuestions[i].question = val;
                      return [...prev];
                    })
                  }
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
                  isFinished={isQuestionReady}
                  setIsFinished={setIsQuestionReady}
                  value={sq.answer}
                  onChangeFn={(val) =>
                    setQuestions((prev) => {
                      prev[index].subQuestions[i].answer = val;
                      return [...prev];
                    })
                  }
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
          setQuestions((prev) => {
            prev[index] = { ...prev[index], ...updated };
            return [...prev];
          })
        }
        editMode={editMode}
      />
      <ValidationSummary result={validationResult} />
    </Card>
  );
}
