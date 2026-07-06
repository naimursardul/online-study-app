import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { IBaseQuestion } from "@/types/types";
import { client } from "@/utils/utils";
import { toast } from "sonner";
import { useMasterData } from "@/lib/MasterData-context";

type Props = {
  questionId: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  questionType: IBaseQuestion["questionType"];
};

export default function SaveToCollectionButton({
  questionId,
  subjectId,
  chapterId,
  topicId,
  questionType,
}: Props) {
  const { masterData } = useMasterData();

  const [savedCollectionIds, setSavedCollectionIds] = useState<string[]>([]);

  const [isCreating, setIsCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState("");

  // =========================================
  // FETCH SAVED STATUS
  // =========================================
  async function fetchSavedStatus() {
    try {
      const res = await client.get(
        `/collection/saved-question/status/${questionId}`,
      );

      if (res.data.success) {
        setSavedCollectionIds(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load saved status");
    }
  }
  useEffect(() => {
    fetchSavedStatus();
  }, []);

  // =========================================
  // HANDLE OPEN
  // =========================================
  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) return;
  }

  // =========================================
  // TOGGLE QUESTION
  // =========================================
  async function toggleQuestion(collectionId: string) {
    setTogglingId(collectionId);

    try {
      const res = await client.post("/collection/saved-question/toggle", {
        collectionId,
        questionId,
        subjectId,
        chapterId,
        topicId,
        questionType,
      });

      if (res.data.success) {
        await fetchSavedStatus();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update collection");
    } finally {
      setTogglingId(null);
    }
  }

  // =========================================
  // HANDLE COLLECTION CREATION
  // =========================================
  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;

    setIsCreating(true);

    try {
      const res = await client.post("/collection", {
        name,
      });

      if (res.data.success) {
        const collection = res.data.data;

        await toggleQuestion(collection._id);

        setNewName("");
        setIsAddingNew(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create collection");
    } finally {
      setIsCreating(false);
    }
  }
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          {savedCollectionIds.length > 0 ? (
            <BookmarkCheck className="text-destructive" />
          ) : (
            <Bookmark />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-2" align="end">
        <p className="text-sm font-semibold px-2 py-1">Save to collection</p>

        <div className="flex flex-col max-h-52 overflow-y-auto">
          {(masterData.collections || []).map((c) => {
            const checked = savedCollectionIds.includes(c._id);
            const isThisToggling = togglingId === c._id;
            return (
              <button
                key={c._id}
                onClick={() => toggleQuestion(c._id)}
                disabled={isThisToggling}
                className="flex items-center justify-between px-2 py-2 rounded hover:bg-sidebar-accent text-sm cursor-pointer disabled:cursor-not-allowed"
              >
                <span>{c.name}</span>
                {isThisToggling ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  checked && <Check className="size-4 text-chart-2" />
                )}
              </button>
            );
          })}
        </div>

        {isAddingNew ? (
          <div className="flex items-center gap-1 mt-2 px-1">
            <Input
              autoFocus
              placeholder="Collection name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isCreating}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setIsAddingNew(false);
              }}
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              className="h-8"
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? <Loader2 className="size-4 animate-spin" /> : "Add"}
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 w-full px-2 py-2 mt-1 rounded hover:bg-sidebar-accent text-sm text-chart-2 cursor-pointer"
          >
            <Plus className="size-4" />
            Create new collection
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
