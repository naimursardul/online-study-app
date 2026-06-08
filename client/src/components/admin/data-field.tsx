import type { DataFieldProps, IBaseQuestion } from "@/types/types";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/utils/utils";
import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

function ComboboxMulti<T>({
  field,
  formData,
  setFormData,
}: ComboboxMultiProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const fieldName: keyof T = field.name as keyof T;

  const selectedIds: string[] = (formData[fieldName] as string[]) || [];

  const options =
    field.optionData?.filter(
      (o): o is { _id: string; name: string } => "name" in o,
    ) ?? [];

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  function toggle(id: string) {
    setFormData((prev) => {
      const ids = [...(prev[fieldName] as string[])];
      const idx = ids.indexOf(id);
      if (idx > -1) ids.splice(idx, 1);
      else ids.push(id);

      const updated: T = {
        ...prev,
        [fieldName]: ids,
      };
      // cascade reset dependents
      (DEPENDENT_RESETS[String(fieldName)] as string[])?.forEach((dep) => {
        if (dep === "backgroundId") {
          updated["backgroundId" as keyof T] = [] as T[keyof T];
        } else {
          updated[dep as keyof T] = "" as T[keyof T];
        }
      });
      return updated as T;
    });
  }

  function removeOne(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    toggle(id);
  }

  const selectedOptions = options.filter((o) => selectedIds.includes(o._id));

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
              selectedOptions.map((o) => (
                <Badge
                  key={o._id}
                  variant="secondary"
                  className="text-xs gap-1 pr-1 font-normal"
                >
                  {o.name}
                  <button
                    onClick={(e) => removeOne(o._id, e)}
                    className="ml-0.5 rounded-full hover:bg-muted-foreground/30 p-0.5 transition-colors"
                    aria-label={`Remove ${o.name}`}
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
            placeholder={`Search ${field?.label ?? field.name}…`}
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
                    className="cursor-pointer text-sm"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50",
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    {option.name}
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

// ── Main DataField ───────────────────────────────────────────────
export default function DataField<T>({
  formData,
  setFormData,
  field,
  forAllDataPage,
}: DataFieldProps<T>) {
  const fieldName = formData[field.name as keyof T];

  return (
    <div className="space-y-1.5">
      {!forAllDataPage && field?.label && (
        <Label className="text-sm font-medium">{field.label}</Label>
      )}

      {/* ── Input ──────────────────────────────────────────────── */}
      {field?.inputType === "input" && (
        <Input
          type={field?.type || "text"}
          id={field?.name}
          name={field?.name}
          value={(fieldName as string) || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              [field.name as keyof IBaseQuestion]:
                field.type === "number"
                  ? Number(e.target.value)
                  : e.target.value,
            })
          }
          placeholder={
            forAllDataPage
              ? `Search by ${field?.label}`
              : `Enter ${field?.placeholder ?? field?.label}`
          }
          className="h-9 text-sm"
        />
      )}

      {/* ── Textarea ───────────────────────────────────────────── */}
      {field?.inputType === "textarea" && (
        <Textarea
          id={field?.name}
          name={field?.name}
          value={(fieldName as string) || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              [field.name as keyof IBaseQuestion]: e.target.value,
            })
          }
          placeholder={`Enter ${field?.placeholder ?? field?.label}`}
          className="text-sm resize-none min-h-20"
        />
      )}

      {/* ── Select ─────────────────────────────────────────────── */}
      {field?.inputType === "select" && (
        <Select
          value={fieldName ? String(fieldName) : ""}
          onValueChange={(value) => {
            setFormData((prev) => {
              const obj: T = { ...prev, [fieldName as keyof T]: value } as T;
              DEPENDENT_RESETS[fieldName as string]?.forEach((dep) => {
                if (dep === "backgroundId") {
                  obj["backgroundId" as keyof T] = [] as T[keyof T];
                } else {
                  obj[dep as keyof T] = "" as T[keyof T];
                }
              });
              return { ...obj };
            });
          }}
        >
          <SelectTrigger className="w-full h-9 text-sm cursor-pointer">
            <SelectValue
              placeholder={`Select ${field?.placeholder ?? field?.label}`}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {field?.optionData && field?.optionData.length > 0 ? (
                field.optionData.map((option) =>
                  "name" in option ? (
                    <SelectItem
                      className="text-sm cursor-pointer"
                      key={option._id}
                      value={option._id}
                    >
                      {option.name}
                    </SelectItem>
                  ) : null,
                )
              ) : (
                <SelectItem value="__empty__" disabled className="text-sm">
                  No {field.label ?? field.name} available
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {/* ── Checkbox / Combobox ────────────────────────────────── */}
      {field?.inputType === "checkbox" &&
        (forAllDataPage ? (
          // On the filter page: searchable multi-select combobox
          field?.optionData && field?.optionData.length > 0 ? (
            <ComboboxMulti
              field={field}
              formData={formData}
              setFormData={setFormData}
            />
          ) : (
            <p className="text-sm text-muted-foreground pl-1">
              No {field?.label ?? field?.name} available.
            </p>
          )
        ) : // On the form: classic checkbox list
        field?.optionData?.length ? (
          <div className="space-y-2">
            {field.optionData.map((option) =>
              "name" in option ? (
                <div key={option._id} className="flex items-center gap-2">
                  <Checkbox
                    id={`${field.name}-${option._id}`}
                    className="cursor-pointer"
                    checked={((fieldName as string[]) || []).includes(
                      option._id,
                    )}
                    onCheckedChange={(checked: boolean) => {
                      setFormData((prev) => {
                        const ids = [
                          ...((prev[field.name as keyof T] as string[]) || []),
                        ];
                        if (checked) {
                          if (!ids.includes(option._id)) ids.push(option._id);
                        } else {
                          const idx = ids.indexOf(option._id);
                          if (idx > -1) ids.splice(idx, 1);
                        }
                        const updated: T = {
                          ...prev,
                          [field.name as keyof T]: ids,
                        };
                        DEPENDENT_RESETS[field.name as string]?.forEach(
                          (dep) => {
                            if (dep === "backgroundId") {
                              updated["backgroundId" as keyof T] =
                                [] as T[keyof T];
                            } else {
                              updated[dep as keyof T] = "" as T[keyof T];
                            }
                          },
                        );
                        return updated as T;
                      });
                    }}
                  />
                  <Label
                    htmlFor={`${field.name}-${option._id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.name}
                  </Label>
                </div>
              ) : null,
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground pl-1">
            No {field?.label ?? field?.name} available.
          </p>
        ))}
    </div>
  );
}
