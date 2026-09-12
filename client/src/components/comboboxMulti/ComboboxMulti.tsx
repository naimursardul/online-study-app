import { cn } from "@/utils/utils";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { useState } from "react";
import type {
  DataFieldProps,
  IRecordPair,
  IRecordPairOption,
} from "@/types/types";

// ── Multi-select Combobox (replaces checkbox on filter page) ─────
interface ComboboxMultiProps<T> {
  field: DataFieldProps<T>["field"];
  formData: DataFieldProps<T>["formData"];
  setFormData: DataFieldProps<T>["setFormData"];
}
// ── Shared dependent-reset map ───────────────────────────────────
const DEPENDENT_RESETS: Record<string, string[]> = {
  levelId: ["backgroundId", "subjectId", "chapterId", "topicId"],
  backgroundId: ["subjectId", "chapterId", "topicId"],
  subjectId: ["chapterId", "topicId"],
  chapterId: ["topicId"],
};

// recordId holds {institutionId, yearId} pairs; the composite id is what the
// option list tracks.
const pairId = (pair: IRecordPair) => `${pair.institutionId}_${pair.yearId}`;

export default function ComboboxMulti<T>({
  field,
  formData,
  setFormData,
}: ComboboxMultiProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const fieldName = field.name;
  const isRecordField = fieldName === "recordId";

  const selectedIds: string[] = isRecordField
    ? ((formData[fieldName as keyof T] as IRecordPair[]) || []).map(pairId)
    : ((formData[fieldName as keyof T] || []) as string[]);

  const filtered = (field.optionData || []).filter((o) =>
    "name" in o ? o.name.toLowerCase().includes(search.toLowerCase()) : false,
  );

  // =========================================
  // TOGGLE
  // =========================================
  function toggle(id: string) {
    setFormData((prev) => {
      // recordId toggles whole institution-year pairs, not bare ids.
      if (isRecordField) {
        const pairs = [...((prev[fieldName as keyof T] as IRecordPair[]) || [])];
        const idx = pairs.findIndex((p) => pairId(p) === id);
        if (idx > -1) pairs.splice(idx, 1);
        else {
          const option = (
            field.optionData as IRecordPairOption[] | undefined
          )?.find((o) => o._id === id);
          if (option)
            pairs.push({
              institutionId: option.institutionId,
              yearId: option.yearId,
            });
        }
        return { ...prev, [fieldName]: pairs } as T;
      }

      const ids = [...(prev[fieldName as keyof T] as string[])];
      const idx = ids.indexOf(id);
      if (idx > -1) ids.splice(idx, 1);
      else ids.push(id);

      const updated: T = {
        ...prev,
        [fieldName]: ids,
      };
      // cascade reset dependents, preserving each field's shape (some pages
      // hold list-shaped filters, e.g. topicId as an array)
      (DEPENDENT_RESETS[String(fieldName)] as string[])?.forEach((dep) => {
        updated[dep as keyof T] = (
          Array.isArray(prev[dep as keyof T]) ? [] : ""
        ) as T[keyof T];
      });
      return updated as T;
    });
  }

  function removeOne(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    toggle(id);
  }

  const selectedOptions = filtered.filter((o) => {
    return selectedIds.includes(o._id);
  });
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-auto min-h-9 justify-between px-3 py-1.5 font-normal text-sm",
            !selectedIds.length && "text-muted-foreground",
          )}
        >
          {/* Selected badges or placeholder */}
          <span className="flex flex-wrap gap-1 flex-1 min-w-0">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((o, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-xs gap-1 pr-1 font-normal"
                >
                  {"name" in o ? o.name : o._id}
                  <button
                    onClick={(e) => removeOne(o._id, e)}
                    className="ml-0.5 rounded-full hover:bg-muted-foreground/30 p-0.5 transition-colors"
                    aria-label={`Remove ${
                      "name" in o ? o.name : o._id
                    }`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              ))
            ) : (
              <span>{`Select ${field?.placeholder ?? field?.label}`}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${field?.label ?? fieldName}…`}
            value={search}
            onValueChange={setSearch}
            className="h-9 text-sm"
          />
          <CommandList>
            <CommandEmpty className="py-3 text-center text-sm text-muted-foreground">
              No results found.
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((option) => {
                const isSelected = selectedIds.includes(option._id);
                return (
                  <CommandItem
                    key={option._id}
                    value={option._id}
                    onSelect={() => toggle(option._id)}
                    className={`cursor-pointer text-sm`}
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50",
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    {"name" in option ? option.name : option._id}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
