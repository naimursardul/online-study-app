import QuestionBank from "@/components/question-bank/question-bank";
import ServiceFilter from "@/components/service-filter";

export default function page() {
  return (
    <div className="flex flex-col gap-9 mt-5">
      <div className="mb-5">
        <ServiceFilter />
      </div>
      <QuestionBank />
    </div>
  );
}
