import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export function MCQCard({ question }: any) {
  return (
    <Card className="p-6 space-y-5">
      <h3 className="font-semibold">{question.question}</h3>

      <div className="space-y-2">
        {question.options.map((option: string) => (
          <div
            key={option}
            className={`
              rounded-lg
              border
              p-3
              ${
                option === question.correctAnswer
                  ? "border-green-500 bg-green-500/10"
                  : ""
              }
            `}
          >
            {option}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle2 size={18} />
        Correct Answer
      </div>

      <p className="text-sm text-muted-foreground">{question.explanation}</p>
    </Card>
  );
}
