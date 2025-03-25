import AllTopics from "@/components/data-management-ui/all-topics";
import TopicUpload from "@/components/data-management-ui/topic-upload";

export default function page() {
  return (
    <div className="w-full flex flex-col-reverse lg:flex-row max-lg:items-center gap-5">
      <AllTopics />
      <TopicUpload />
    </div>
  );
}
