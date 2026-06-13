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
import ComboboxMulti from "../comboboxMulti/ComboboxMulti";

// ── Shared dependent-reset map ───────────────────────────────────
const DEPENDENT_RESETS: Record<string, string[]> = {
  levelId: ["backgroundId", "subjectId", "chapterId", "topicId"],
  backgroundId: ["subjectId", "chapterId", "topicId"],
  subjectId: ["chapterId", "topicId"],
  chapterId: ["topicId"],
};

// ── Main DataField ───────────────────────────────────────────────

export default function DataField<T>({
  formData,
  setFormData,
  field,
  forAllDataPage,
}: DataFieldProps<T>) {
  const fieldName = field.name;
  const fieldValue = formData[fieldName as keyof T];

  return (
    <div className="space-y-1.5">
      {!forAllDataPage && field?.label && (
        <Label className="text-sm font-medium">{field.label}</Label>
      )}

      {/* ── Input ──────────────────────────────────────────────── */}
      {field?.inputType === "input" && (
        <Input
          type={field?.type || "text"}
          id={fieldName}
          name={fieldName}
          value={(fieldValue as string) || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              [fieldName as keyof IBaseQuestion]:
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
          id={fieldName}
          name={fieldName}
          value={(fieldValue as string) || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              [fieldName as keyof IBaseQuestion]: e.target.value,
            })
          }
          placeholder={`Enter ${field?.placeholder ?? field?.label}`}
          className="text-sm resize-none min-h-20"
        />
      )}

      {/* ── Select ─────────────────────────────────────────────── */}
      {field?.inputType === "select" && (
        <Select
          value={fieldValue ? String(fieldValue) : ""}
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
                  No {field.label ?? fieldName} available
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {/* ── Checkbox / Combobox ────────────────────────────────── */}
      {
        field?.inputType === "checkbox" &&
          // forAllDataPage ? (
          // On the filter page: searchable multi-select combobox
          (field?.optionData && field?.optionData.length > 0 ? (
            <ComboboxMulti
              field={field}
              formData={formData}
              setFormData={setFormData}
            />
          ) : (
            <p className="text-sm text-muted-foreground pl-1">
              No {field?.label ?? fieldName} available.
            </p>
          ))
        // ) : // On the form: classic checkbox list
        // field?.optionData?.length ? (
        //   <div className="space-y-2">
        //     {field.optionData.map((option) =>
        //       "name" in option ? (
        //         <div key={option._id} className="flex items-center gap-2">
        //           <Checkbox
        //             id={`${fieldName}-${option._id}`}
        //             className="cursor-pointer"
        //             checked={((fieldValue as string[]) || []).includes(
        //               option._id,
        //             )}
        //             onCheckedChange={(checked: boolean) => {
        //               setFormData((prev) => {
        //                 const ids = [
        //                   ...((prev[fieldName as keyof T] as string[]) || []),
        //                 ];
        //                 if (checked) {
        //                   if (!ids.includes(option._id)) ids.push(option._id);
        //                 } else {
        //                   const idx = ids.indexOf(option._id);
        //                   if (idx > -1) ids.splice(idx, 1);
        //                 }
        //                 const updated: T = {
        //                   ...prev,
        //                   [fieldName as keyof T]: ids,
        //                 };
        //                 DEPENDENT_RESETS[fieldName as string]?.forEach(
        //                   (dep) => {
        //                     if (dep === "backgroundId") {
        //                       updated["backgroundId" as keyof T] =
        //                         [] as T[keyof T];
        //                     } else {
        //                       updated[dep as keyof T] = "" as T[keyof T];
        //                     }
        //                   },
        //                 );
        //                 return updated as T;
        //               });
        //             }}
        //           />
        //           <Label
        //             htmlFor={`${fieldName}-${option._id}`}
        //             className="text-sm font-normal cursor-pointer"
        //           >
        //             {option.name}
        //           </Label>
        //         </div>
        //       ) : null,
        //     )}
        //   </div>
        // ) : (
        //   <p className="text-sm text-muted-foreground pl-1">
        //     No {field?.label ?? fieldName} available.
        //   </p>
        // )
      }
    </div>
  );
}
