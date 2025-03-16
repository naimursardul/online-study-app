import { allQuestions } from "@/app/storage/storage";
import SingleQuestionBank from "@/components/single-question-bank/single-question-bank";
import SingleQuestionBankSidebar from "@/components/single-question-bank/single-question-bank-sidebar";
import { getBoardQusetonDetails } from "@/lib/utils";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const qDetails = getBoardQusetonDetails(slug);

  const filteredQuestion = allQuestions.filter(
    (q) => q.questionType === qDetails?.questionType
  );

  return (
    <div className="flex flex-col md:flex-row gap-3 mt-10">
      <SingleQuestionBankSidebar />
      {/* <div className="w-full"> */}
      {qDetails?.questionType && (
        <SingleQuestionBank
          qType={qDetails?.questionType}
          allQuestions={filteredQuestion}
        />
      )}
      {/* </div> */}
    </div>
  );
}
