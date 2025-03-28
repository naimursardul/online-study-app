import AllTopics from "@/components/data-management-ui/all-topics";
import TopicUpload from "@/components/data-management-ui/topic-upload";

export default function page() {
  return (
    <div className="w-full flex flex-col items-center gap-10">
      <TopicUpload />
      <AllTopics />
    </div>
  );
}
