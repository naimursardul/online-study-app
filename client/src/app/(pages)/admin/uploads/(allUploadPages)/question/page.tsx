import QuestionUpload from "@/components/data-management-ui/question-upload";

export default function page() {
  return (
    <div className="w-full h-full space-y-5">
      <h1 className="text-2xl font-semibold">Upload Question</h1>
      <QuestionUpload />
    </div>
  );
}
