import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export default function ServiceFilter() {
  return (
    <div className="w-full flex flex-wrap gap-5 justify-between items-center">
      <ToggleGroup type="single" className="space-x-2">
        <ToggleGroupItem
          value="model-test"
          className="rounded-2xl px-4 py-4 max-md:text-xs  border-1 border-sidebar-border cursor-pointer"
        >
          Model Test
        </ToggleGroupItem>
        <ToggleGroupItem
          value="subject"
          className="rounded-2xl px-4 py-4 max-md:text-xs  border-1 border-sidebar-border cursor-pointer"
        >
          Subject
        </ToggleGroupItem>
        <ToggleGroupItem
          value="institution"
          className="rounded-2xl px-4 py-4 max-md:text-xs  border-1 border-border cursor-pointer"
        >
          Institution
        </ToggleGroupItem>
      </ToggleGroup>
      <form action="">
        <input
          type="text"
          placeholder="Search"
          className="max-md:w-[250px] border-1 border-border rounded-xl h-[38px] outline-none px-3 py-4"
        />
      </form>
    </div>
  );
}
