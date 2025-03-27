import AllSubjects from "@/components/data-management-ui/all-subjects";
import SubjectUpload from "@/components/data-management-ui/subject-upload";

export default function page() {
  return (
    <div className="w-full flex flex-col-reverse lg:flex-row max-lg:items-center gap-5">
      <AllSubjects />
      <SubjectUpload />
    </div>
  );
}
