import SingleQuestionBank from "@/components/single-question-bank/single-question-bank";
import SingleQuestionBankSidebar from "@/components/single-question-bank/side-bar/single-question-bank-sidebar";
import { getBoardQusetonDetails } from "@/lib/utils";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const qDetails = getBoardQusetonDetails(slug);

  console.log(qDetails);

  console.log(qDetails);
  return (
    <div className="flex flex-col md:flex-row gap-3 mt-10">
      <SingleQuestionBankSidebar slug={slug} />
      {/* <div className="w-full"> */}
      {/* {qDetails?.questionType && ( */}
      <SingleQuestionBank qDetails={qDetails} />
      {/* )} */}
      {/* </div> */}
    </div>
  );
}
