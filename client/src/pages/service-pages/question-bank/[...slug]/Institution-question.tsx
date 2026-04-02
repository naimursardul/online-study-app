import SingleQuestionBankSidebar from "@/components/qb/single-question-bank/side-bar/single-question-bank-sidebar";
import SingleQuestionBank from "@/components/qb/single-question-bank/single-question-bank";
import { getBoardQusetonDetails } from "@/lib/utils";
import { useParams } from "react-router-dom";

export default function InstitutionQuestion() {
  const { slug } = useParams();
  const qDetails = getBoardQusetonDetails(slug || "");

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
