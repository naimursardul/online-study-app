import AllChapter from "@/components/data-management-ui/all-chapters";
import ChapterUpload from "@/components/data-management-ui/chapter-upload";

export default function page() {
  return (
    <div className="w-full flex flex-col-reverse lg:flex-row max-lg:items-center gap-5">
      <AllChapter />
      <ChapterUpload />
    </div>
  );
}
