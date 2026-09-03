import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import ReactMarkdownRender from "../../text-editor/ReactMarkdownRender";
import TextEditor from "../../text-editor/TextEditor";
import type { IWritten } from "@/types/types";
import QuestionMetaSection from "./QuestionMetaSection";
import ValidationSummary from "./ValidationSummary ";
import type { IQuestionValidationResult } from "@/utils/validateQuestion";
import { Check, Pencil, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { labelOf } from "@/utils/questionTypes";

interface WrittenCardProps {
  setQuestions: React.Dispatch<React.SetStateAction<IWritten[]>>;
  index: number;
  question: IWritten;
  validationResult: IQuestionValidationResult;
}

// Editor card for the `simple` family (SQ / EQ / WQ) — one question, one answer.
export default function WrittenCard({
  setQuestions,
  index,
  question,
  validationResult,
}: WrittenCardProps) {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isQuestionReady, setIsQuestionReady] = useState(false);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center gap-2">
        <Label className="text-muted-foreground">
          {labelOf(question.questionType)}
        </Label>

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
                  This will remove this question and its answer from the list.
                  This action cannot be undone.
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

      {/* Answer */}
      <div className="space-y-2">
        <Label>Answer</Label>
        {editMode ? (
          <TextEditor
            isFinished={isQuestionReady}
            setIsFinished={setIsQuestionReady}
            value={question.answer}
            onChangeFn={(val) =>
              setQuestions((prev) => {
                prev[index].answer = val;
                return [...prev];
              })
            }
          />
        ) : (
          <ReactMarkdownRender text={question.answer} />
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
