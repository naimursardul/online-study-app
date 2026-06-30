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
import { Check, CheckCircle2, Pencil, Save, Trash2 } from "lucide-react";
import ReactMarkdownRender from "../../text-editor/ReactMarkdownRender";
import TextEditor from "../../text-editor/TextEditor";
import type { IMCQ } from "@/types/types";
import QuestionMetaSection from "./QuestionMetaSection";
import type { IQuestionValidationResult } from "@/utils/validateQuestion";
import ValidationSummary from "./ValidationSummary ";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface MCQCardProps {
  setQuestions: React.Dispatch<React.SetStateAction<IMCQ[]>>;
  index: number;
  question: IMCQ;
  validationResult: IQuestionValidationResult;
}

export default function MCQCard({
  setQuestions,
  index,
  question,
  validationResult,
}: MCQCardProps) {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isQuestionReady, setIsQuestionReady] = useState<boolean>(false);
  return (
    <Card className="p-6 pt-10 space-y-6">
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant={editMode ? "default" : "outline"}
          onClick={() => {
            if (editMode && !isQuestionReady) {
              setIsQuestionReady(true);
              return;
            }
            if (setIsQuestionReady) setIsQuestionReady(false);
            setEditMode((prev) => !prev);
          }}
          className="gap-2"
        >
          {editMode ? (
            <>
              {isQuestionReady ? (
                <>
                  <Check size={16} />
                  Done Editing
                </>
              ) : (
                <>
                  <Save size={16} /> Save
                </>
              )}
            </>
          ) : (
            <>
              <Pencil size={16} />
              Edit
            </>
          )}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="border-border text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <Trash2 size={16} className="mr-1" />
              Discard
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard this question?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove this question and all of its sub questions from
                the list. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel type="button" className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="button"
                onClick={() => {
                  setQuestions((prev) => {
                    const newArr = prev.filter((_, indx) => indx !== index);
                    return [...newArr];
                  });
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              >
                Discard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
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
        {question.options?.map((option, i) => (
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
            onValueChange={(val) =>
              setQuestions((prev) => {
                prev[index].correctAnswer = val;
                return [...prev];
              })
            }
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
