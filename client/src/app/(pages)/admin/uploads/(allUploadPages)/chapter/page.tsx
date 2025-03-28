import AllChapter from "@/components/data-management-ui/all-chapters";
import ChapterUpload from "@/components/data-management-ui/chapter-upload";

export default function page() {
  return (
    <div className="w-full flex flex-col items-center gap-10">
      <ChapterUpload />
      <AllChapter />
    </div>
  );
}
