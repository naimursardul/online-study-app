import AllClasses from "@/components/data-management-ui/all-classes";
import ClassUpload from "@/components/data-management-ui/class-upload";

export default function page() {
  return (
    <div className="w-full flex flex-col-reverse lg:flex-row max-lg:items-center gap-5">
      <AllClasses />
      <ClassUpload />
    </div>
  );
}
