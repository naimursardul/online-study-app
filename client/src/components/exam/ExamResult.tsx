import { Award, CheckCircle2, ListOrdered, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ExamResultSummary = {
  correctCount: number;
  wrongCount: number;
  obtainedMarks: number;
  totalMarks: number;
  totalQuestions: number;
  percentage: number;
};

type Props = {
  summary: ExamResultSummary;
  onReview: () => void;
  onBack: () => void;
};

export default function ExamResult({ summary, onReview, onBack }: Props) {
  return (
    <div className="max-w-lg mx-auto space-y-5 rounded-2xl border border-sidebar-border bg-background p-6 text-center">
      <h2 className="text-xl font-semibold">Exam submitted 🎉</h2>

      <div className="text-4xl font-bold text-chart-2">
        {summary.percentage}%
      </div>

      <div className="grid grid-cols-2 gap-3 text-left">
        <div className="flex items-center gap-2 rounded-lg bg-sidebar px-3 py-2.5">
          <ListOrdered className="size-5 text-chart-2" />
          <span>Total: {summary.totalQuestions}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-sidebar px-3 py-2.5">
          <CheckCircle2 className="size-5 text-green-500" />
          <span>Correct: {summary.correctCount}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-sidebar px-3 py-2.5">
          <XCircle className="size-5 text-red-500" />
          <span>Wrong: {summary.wrongCount}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-sidebar px-3 py-2.5">
          <Award className="size-5 text-chart-2" />
          <span>
            Marks: {summary.obtainedMarks}/{summary.totalMarks}
          </span>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <Button onClick={onReview}>Review exam</Button>
        <Button variant="secondary" onClick={onBack}>
          Back to exams
        </Button>
      </div>
    </div>
  );
}
