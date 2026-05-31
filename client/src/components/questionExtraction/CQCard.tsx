import { Card } from "@/components/ui/card";
import ReactMarkdownRender from "../text-editor/ReactMarkdownRender";
import type { IExtractedCQQuestion } from "@/types/types";

export default function CQCard({
  question,
}: {
  question: IExtractedCQQuestion;
}) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-semibold mb-2">উদ্দীপক</h3>

        <ReactMarkdownRender text={question.statement} />
      </div>

      {question.subQuestions.map(
        (q: IExtractedCQQuestion["subQuestions"][0]) => (
          <Card key={q.questionNo} className="p-4">
            <ReactMarkdownRender text={q.question} />
            <ReactMarkdownRender text={q.answer} />
          </Card>
        ),
      )}
    </Card>
  );
}
