import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ListChecks, Plus, Trophy } from "lucide-react";
import { client } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ExamBuilderForm from "../../../components/exam/ExamBuilderForm";
import ExamList from "../../../components/exam/ExamList";
import type { ExamGenResType, ExamListItemType } from "@/types/types";
import { Separator } from "@/components/ui/separator";

function Exam() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamListItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  // When set, the dialog shows the generated-exam details step
  const [generated, setGenerated] = useState<ExamGenResType | null>(null);

  const pendingCount = exams.filter((e) => e.status === "generated").length;

  async function fetchExams() {
    try {
      const res = await client.get("/exam/list");
      if (res.data?.success) setExams(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExams();
  }, []);

  function openCreate() {
    setGenerated(null);
    setOpen(true);
  }

  function handleGenerated(data: ExamGenResType) {
    setGenerated(data);
    fetchExams();
  }

  function startLater() {
    setOpen(false);
    setGenerated(null);
  }

  return (
    <div className="space-y-6 ">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Exams</h1>
          <p className="flex gap-3 text-sm text-muted-foreground">
            <span>Total: {exams.length}</span>
            <Separator orientation={"vertical"} />
            <span>pending: {pendingCount}</span>
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Create exam
        </Button>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading…</div>
      ) : (
        <ExamList exams={exams} onChanged={fetchExams} />
      )}

      {/* CREATE / DETAILS DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {!generated ? (
            <>
              <DialogHeader>
                <DialogTitle>Create exam</DialogTitle>
                <DialogDescription>
                  Pick a subject, scope, difficulty and size to generate an MCQ
                  exam.
                </DialogDescription>
              </DialogHeader>
              <ExamBuilderForm onGenerated={handleGenerated} />
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{generated.exam.examName}</DialogTitle>
                <DialogDescription>
                  Your exam is ready. Start now or later from the exam list.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-3 py-2">
                <div className="flex flex-col items-center gap-1 rounded-lg bg-sidebar px-3 py-3">
                  <ListChecks className="size-5 text-chart-2" />
                  <span className="text-lg font-semibold">
                    {generated.questions.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Questions
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-lg bg-sidebar px-3 py-3">
                  <Clock className="size-5 text-chart-2" />
                  <span className="text-lg font-semibold">
                    {generated.exam.totalTime}s
                  </span>
                  <span className="text-xs text-muted-foreground">Time</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-lg bg-sidebar px-3 py-3">
                  <Trophy className="size-5 text-chart-2" />
                  <span className="text-lg font-semibold">
                    {generated.exam.totalMarks}
                  </span>
                  <span className="text-xs text-muted-foreground">Marks</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/exam/${generated.exam._id}`)}
                >
                  Start exam
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={startLater}
                >
                  Start later
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Exam;
