import AllClasses from "@/components/data-management-ui/all-classes";
import ClassUpload from "@/components/data-management-ui/class-upload";

export default function page() {
  return (
    <div className="w-full flex flex-col items-center gap-10">
      <ClassUpload />
      <AllClasses />
    </div>
  );
}
