import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";
import { QuestionType, RecordType } from "@/lib/type";

type Props = {
  formData: QuestionType;
  setFormData: (data: QuestionType) => void;
  recordData: RecordType[];
  width?: string;
};

export default function RecordSelector({
  formData,
  setFormData,
  recordData,
  width,
}: Props) {
  const [open, setOpen] = useState(false);

  const toggleRecord = (institution: string, checked: boolean) => {
    const record = [...formData.record];

    if (checked && !record.includes(institution)) {
      record.push(institution);
    } else if (!checked && record.includes(institution)) {
      const index = record.indexOf(institution);
      record.splice(index, 1);
    }

    setFormData({ ...formData, record });
  };

  return (
    <div className="relative" style={{ width }}>
      <Command className="rounded-lg border">
        <div className="relative">
          <CommandInput
            placeholder="Search records..."
            onFocus={() => setOpen(true)}
            className="pr-10"
          />
          {open && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {open && (
          <CommandList className="z-10 w-full max-h-40 px-3 py-4 overflow-auto absolute top-10 left-0 bg-background rounded-lg rounded-t-none shadow">
            <CommandGroup>
              {recordData.map((r) => (
                <CommandItem key={r._id} className="flex gap-2">
                  <Checkbox
                    checked={formData.record.includes(r.institution)}
                    onCheckedChange={(checked: boolean) =>
                      toggleRecord(r.institution, checked)
                    }
                  />
                  <Label>{r.institution + " - " + r.year}</Label>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  );
}
