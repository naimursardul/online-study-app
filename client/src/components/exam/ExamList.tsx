import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BookOpen, Clock, ListChecks, Play, Trash2, Eye } from "lucide-react";
import { client, extractIdTo_ } from "@/utils/utils";
import { useMasterData } from "@/lib/MasterData-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { ExamListItemType } from "@/types/types";

type Props = {
  exams: ExamListItemType[];
  onChanged: () => void;
};

export default function ExamList({ exams, onChanged }: Props) {
  const navigate = useNavigate();
  const { masterData } = useMasterData();

  async function handleDelete(examId: string) {
    try {
      const res = await client.delete(`/exam/${examId}`);
      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to delete exam.");
        return;
      }
      toast.success("Exam deleted.");
      onChanged();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete exam.");
    }
  }

  if (!exams.length) {
    return (
      <div className="text-center text-muted-foreground py-12 border border-dashed border-sidebar-border rounded-xl">
        No exams yet. Create your first exam.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exams.map((exam) => {
        const isPending = exam.status === "generated";
        return (
          <div
            key={exam._id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between rounded-xl border border-sidebar-border bg-background p-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{exam.examName}</span>
                <Badge variant={isPending ? "secondary" : "default"}>
                  {isPending ? "Pending" : "Submitted"}
                </Badge>
                {exam?.difficulty && (
                  <Badge variant="secondary">{exam.difficulty}</Badge>
                )}
                {exam?.mode && (
                  <Badge variant="secondary">
                    {exam.mode === "weak" ? "Weak-focused" : "Random"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <BookOpen className="size-4" />
                  {extractIdTo_(masterData.subjects, exam.subjectId, "name")}
                </span>
                <span className="flex items-center gap-1">
                  <ListChecks className="size-4" />
                  {exam.questionIds?.length ?? exam.size} Qs
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {exam.totalTime}s
                </span>
                {exam.result && (
                  <span className="text-chart-2 font-medium">
                    Score: {exam.result.obtainedMarks}/{exam.totalMarks} (
                    {exam.result.percentage}%)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPending ? (
                <Button size="sm" onClick={() => navigate(`/exam/${exam._id}`)}>
                  <Play className="size-4" /> Start
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/exam/${exam._id}`)}
                >
                  <Eye className="size-4" /> Review
                </Button>
              )}

              {isPending && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this exam?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{exam.examName}" will be permanently removed. This
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(exam._id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
