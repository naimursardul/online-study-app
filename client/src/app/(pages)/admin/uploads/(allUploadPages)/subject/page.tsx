import AllSubjects from "@/components/data-management-ui/all-subjects";
import SubjectUpload from "@/components/data-management-ui/subject-upload";

export default function page() {
  return (
    <div className="w-full flex flex-col items-center gap-10">
      <SubjectUpload />
      <AllSubjects />
    </div>
  );
}
