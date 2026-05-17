import AllQuestion from "@/components/admin/question/all-questions/all-question";
import QuestionUpload from "@/components/admin/question/question-upload";
import FloatingUploadWidget from "@/components/imgUpload/ImgUploadUi";
import type { IMasterData } from "@/types/types";
import { useOutletContext } from "react-router-dom";

export default function Question() {
  const masterData = useOutletContext<IMasterData>();

  return (
    <div className="space-y-10">
      <div className="w-full h-full space-y-5">
        <h1 className="text-2xl font-semibold">Upload Question</h1>
        <QuestionUpload masterData={masterData} />
      </div>

      <AllQuestion />
      <FloatingUploadWidget />
    </div>
  );
}
