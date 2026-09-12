import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { client } from "@/utils/utils";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  QUESTION_TYPE_LIST,
  type QuestionTypeCode,
} from "@/utils/questionTypes";
import type { IExtractionPrompt } from "@/types/types";

type ApiResponse = {
  message: string;
  success: boolean;
  data: IExtractionPrompt | IExtractionPrompt[];
};

// The admin editor for the six per-question-type AI extraction prompts. One
// document per type, keyed by the type code — the prompt body travels as a
// plain string, so quotes, backticks and LaTeX backslashes need no special
// handling anywhere on this page.
export default function Prompt() {
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [selectedType, setSelectedType] = useState<QuestionTypeCode>(
    QUESTION_TYPE_LIST[0].code
  );
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================================
  // Load all six prompts (server seeds defaults on this read)
  // =========================================
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await client.get<ApiResponse>("/extraction-prompt");
        if (!res.data.success) {
          throw new Error(res.data.message || "Failed to load prompts.");
        }
        const byType: Record<string, string> = {};
        for (const row of res.data.data) {
          byType[row.questionType] = row.prompt;
        }
        setPrompts(byType);
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Failed to load extraction prompts.")
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Switching types starts a fresh draft from the saved copy.
  useEffect(() => {
    setDraft(prompts[selectedType] ?? "");
  }, [selectedType, prompts]);

  const dirty = draft !== (prompts[selectedType] ?? "");

  // =========================================
  // Save the draft for the selected type
  // =========================================
  async function handleSave() {
    if (!draft.trim()) {
      return toast.warning("Prompt cannot be empty.");
    }
    setSaving(true);
    try {
      const res = await client.put<ApiResponse>(
        `/extraction-prompt/${selectedType}`,
        { prompt: draft }
      );
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to save prompt.");
      }
      setPrompts((prev) => ({ ...prev, [selectedType]: draft }));
      toast.success(`${selectedType} prompt saved.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save prompt."));
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // Reset the selected type to the built-in default
  // =========================================
  async function handleReset() {
    setSaving(true);
    try {
      const res = await client.post<ApiResponse>(
        `/extraction-prompt/${selectedType}/reset`
      );
      if (!res.data.success || !("prompt" in (res.data.data ?? {}))) {
        throw new Error(res.data.message || "Failed to reset prompt.");
      }
      const prompt = (res.data.data as IExtractionPrompt).prompt;
      setPrompts((prev) => ({ ...prev, [selectedType]: prompt }));
      toast.success(`${selectedType} prompt reset to default.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to reset prompt."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <h2 className="text-xl font-semibold text-center">
        AI Extraction Prompts
      </h2>

      {/* Question type switcher — one tab per registry entry */}
      <div className="flex flex-wrap justify-center gap-2">
        {QUESTION_TYPE_LIST.map(({ code, label }) => (
          <Button
            key={code}
            type="button"
            variant={code === selectedType ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedType(code)}
          >
            {label}
            {prompts[code] !== undefined && code === selectedType && dirty
              ? " •"
              : ""}
          </Button>
        ))}
      </div>

      <Card className="w-full max-w-4xl p-4 shadow-md">
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-10">
              Loading prompts…
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-4"
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                spellCheck={false}
                className="w-full min-h-[60vh] font-mono text-xs leading-relaxed p-3 rounded-md border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  className="cursor-pointer"
                  onClick={handleReset}
                >
                  <RotateCcw />
                  Reset to default
                </Button>
                <Button type="submit" disabled={saving || !dirty}>
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-background"></div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save />
                      Save {selectedType} prompt
                      {dirty ? " (unsaved)" : ""}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
