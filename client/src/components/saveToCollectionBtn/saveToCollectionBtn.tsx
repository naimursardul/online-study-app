import { useState } from "react";
import { Bookmark, BookmarkCheck, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { client } from "@/utils/utils";
import { toast } from "sonner";
import type { ICollection } from "@/types/types";
import { Skeleton } from "../ui/skeleton";

export default function SaveToCollectionButton({
  questionId,
  collections,
  setCollections,
  collectionFetchLoading,
}: {
  questionId: string;
  collections: (ICollection & { _id: string })[];
  setCollections: React.Dispatch<
    React.SetStateAction<(ICollection & { _id: string })[]>
  >;
  collectionFetchLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null); // which collection is loading now

  const isSaved = (collections || []).some((c) =>
    c.questionIds.includes(questionId),
  );

  // Save / unsave question in a collection — shows loading, no instant change
  async function handleToggle(collectionId: string) {
    setTogglingId(collectionId); // show spinner on this item only

    try {
      const res = await client.patch(
        `collection/${collectionId}/toggle-question`,
        {
          questionId,
        },
      );

      if (!res.data.success) throw new Error(res.data.message);

      // update UI only after server confirms
      setCollections((prev) =>
        prev.map((c) => (c._id === collectionId ? res.data.data : c)),
      );
    } catch (error) {
      console.error("Failed to toggle question", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle question",
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;

    setIsLoading(true);
    try {
      const res = await client.post("/collection", { name, questionId });

      if (!res.data.success) throw new Error(res.data.message);

      setCollections((prev) => [res.data.data, ...prev]);
      setNewName("");
      setIsEditorOpen(false);
    } catch (error) {
      console.error("Failed to create collection", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create collection",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          {collectionFetchLoading ? (
            <Skeleton className="size-8 rounded-full" />
          ) : isSaved ? (
            <BookmarkCheck className="text-destructive" />
          ) : (
            <Bookmark />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-2" align="end">
        <p className="text-sm font-semibold px-2 py-1">Save to collection</p>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col max-h-52 overflow-y-auto">
            {(collections || []).map((c) => {
              const checked = c.questionIds.includes(questionId);
              const isThisToggling = togglingId === c._id;
              return (
                <button
                  key={c._id}
                  onClick={() => handleToggle(c._id)}
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
        )}

        {isEditorOpen ? (
          <div className="flex items-center gap-1 mt-2 px-1">
            <Input
              autoFocus
              placeholder="Collection name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isLoading && isEditorOpen}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setIsEditorOpen(false);
              }}
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              className="h-8"
              onClick={handleCreate}
              disabled={isLoading && isEditorOpen}
            >
              {isLoading && isEditorOpen ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditorOpen(true)}
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
