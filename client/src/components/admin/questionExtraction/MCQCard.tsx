import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import ReactMarkdownRender from "../../text-editor/ReactMarkdownRender";
import TextEditor from "../../text-editor/TextEditor";
import type { IMCQ } from "@/types/types";
import QuestionMetaSection from "./QuestionMetaSection";
import type { IQuestionValidationResult } from "@/utils/validateQuestion";
import ValidationSummary from "./ValidationSummary ";

interface MCQCardProps {
  setQuestions: React.Dispatch<React.SetStateAction<IMCQ[]>>;
  index: number;
  isQuestionReady: boolean;
  setIsQuestionReady: React.Dispatch<React.SetStateAction<boolean>>;
  question: IMCQ;
  editMode: boolean;
  validationResult: IQuestionValidationResult;
}

export default function MCQCard({
  setQuestions,
  index,
  isQuestionReady,
  setIsQuestionReady,
  question,
  editMode,
  validationResult,
}: MCQCardProps) {
  return (
    <Card className="p-6 space-y-6">
      {/* Question */}
      <div className="space-y-2">
        <Label>Question</Label>
        {editMode ? (
          <TextEditor
            isFinished={isQuestionReady}
            setIsFinished={setIsQuestionReady}
            value={question.question}
            onChangeFn={(val) =>
              setQuestions((prev) => {
                prev[index].question = val;
                return [...prev];
              })
            }
          />
        ) : (
          <ReactMarkdownRender text={question.question} />
        )}
      </div>
      {/* Options */}
      <div className="space-y-4">
        <Label>Options</Label>
        {question.options.map((option, i) => (
          <div key={i} className="space-y-1 ml-4">
            {editMode ? (
              <TextEditor
                isFinished={isQuestionReady}
                setIsFinished={setIsQuestionReady}
                label={`Option ${i + 1}`}
                value={option}
                onChangeFn={(val) =>
                  setQuestions((prev) => {
                    prev[index].options[i] = val;
                    return [...prev];
                  })
                }
              />
            ) : (
              <div
                className={`rounded-lg border p-3 ${
                  String(i) === question.correctAnswer
                    ? "border-green-500 bg-green-500/10"
                    : ""
                }`}
              >
                <ReactMarkdownRender text={option} />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Correct Answer */}
      <div className="space-y-2">
        <Label>Correct Answer</Label>
        {editMode ? (
          <Select
            value={question.correctAnswer}
            onValueChange={(val) => handleField("correctAnswer", val)}
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select correct answer" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {question.options.length > 0 ? (
                  question.options.map((_, i) => (
                    <SelectItem
                      key={i}
                      value={String(i)}
                      className="cursor-pointer"
                    >
                      Option {i + 1}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="no-data">
                    No options available.
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 size={18} />
            <span>Option {Number(question.correctAnswer) + 1}</span>
          </div>
        )}
      </div>
      {/* Explanation */}
      <div className="space-y-2">
        <Label>Explanation</Label>
        {editMode ? (
          <TextEditor
            isFinished={isQuestionReady}
            setIsFinished={setIsQuestionReady}
            value={question.explanation}
            onChangeFn={(val) =>
              setQuestions((prev) => {
                prev[index].explanation = val;
                return [...prev];
              })
            }
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            <ReactMarkdownRender text={question.explanation} />
          </p>
        )}
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
