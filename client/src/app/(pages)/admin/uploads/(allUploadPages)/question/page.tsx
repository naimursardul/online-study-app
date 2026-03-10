import AllQuestion from "@/components/admin/question/all-questions/all-question";
import QuestionUpload from "@/components/admin/question/question-upload";

export default function page() {
  return (
    <div className="space-y-10">
      <div className="w-full h-full space-y-5">
        <h1 className="text-2xl font-semibold">Upload Question</h1>
        <QuestionUpload />
      </div>
      <AllQuestion />
    </div>
  );
}
