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

  const allQuestions = [];
  const filteredQuestion = allQuestions.filter(
    (q) => q.questionType === qDetails?.questionType
  );

  console.log(qDetails);
  return (
    <div className="flex flex-col md:flex-row gap-3 mt-10">
      <SingleQuestionBankSidebar slug={slug} />
      {/* <div className="w-full"> */}
      {/* {qDetails?.questionType && ( */}
      <SingleQuestionBank
        qType={qDetails?.questionType}
        allQuestions={filteredQuestion}
      />
      {/* )} */}
      {/* </div> */}
    </div>
  );
}
