import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/Auth-context";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { client } from "@/utils/utils";
import { toast } from "sonner";
import { useMasterData } from "@/lib/MasterData-context";
import SingleMcqQuestion from "@/components/qb/institution-question/single-question/single-mcq-question";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SingleCqQuestion from "@/components/qb/institution-question/single-question/single-cq-queston";
import type { ICollection, ICQ, IMCQ } from "@/types/types";

export default function SingleCollectionPage() {
  const { id: collectionId } = useParams<{ id: string }>();
  const { masterData } = useMasterData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<
    (ICollection & {
      _id: string;
      createdAt: string;
    })[]
  >([]);

  const [questions, setQuestions] = useState<
    ((ICQ & { _id: string }) | (IMCQ & { _id: string }))[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");

  const filteredSubjects = masterData.subjects.filter(
    (subject) =>
      subject.backgroundId.includes(user?.background?._id as string) &&
      subject.levelId === user?.level?._id,
  );
  // chapters list depends on selected subject
  const filteredChapters = masterData.chapters.filter(
    (ch) => !selectedSubject || ch.subjectId === selectedSubject,
  );

  // =========================================
  // GET COLLECTIONS
  // =========================================
  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await client.get("/collection");

        if (res.data.success) {
          setCollections(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchCollections();
  }, []);

  // =========================================
  // COLLECTION CHANGE HANDLER
  // =========================================
  function handleCollectionChange(value: string) {
    if (value === collectionId) return;

    setPage(1);

    navigate(`/collections/${value}`);
  }
  useEffect(() => {
    if (!collectionId) return;

    async function fetchQuestions() {
      setIsLoading(true);
      try {
        const params: Record<string, string> = { page: String(page) };
        if (selectedSubject) params.subjectId = selectedSubject;
        if (selectedChapter) params.chapterId = selectedChapter;

        const res = await client.get(`/collection/${collectionId}/questions`, {
          params,
        });

        if (res.data.success) {
          setQuestions(res.data.data);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load questions");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuestions();
  }, [collectionId, page, selectedSubject, selectedChapter]);

  function handleSubjectChange(value: string) {
    const actualValue = value === "all" ? "" : value;
    setSelectedSubject(actualValue);
    setSelectedChapter("");
    setPage(1);
  }

  function handleChapterChange(value: string) {
    const actualValue = value === "all" ? "" : value;
    setSelectedChapter(actualValue);
    setPage(1);
  }

  function handleClearFilters() {
    setSelectedSubject("");
    setSelectedChapter("");
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4 my-10">
      {/* Filter bar */}
      <div className="sticky top-0 z-20 border-b bg-background/95 px-4 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={collectionId} onValueChange={handleCollectionChange}>
            <SelectTrigger className="w-57.5">
              <SelectValue placeholder="Collection" />
            </SelectTrigger>

            <SelectContent>
              {collections.map((collection) => (
                <SelectItem key={collection._id} value={collection._id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedSubject || "all"}
            onValueChange={handleSubjectChange}
          >
            <SelectTrigger className="w-55">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>

              {filteredSubjects.map((subject) => (
                <SelectItem key={subject._id} value={subject._id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedChapter || "all"}
            onValueChange={handleChapterChange}
            disabled={!selectedSubject}
          >
            <SelectTrigger className="w-55">
              <SelectValue placeholder="All Chapters" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>

              {filteredChapters.map((chapter) => (
                <SelectItem key={chapter._id} value={chapter._id}>
                  {chapter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(selectedSubject || selectedChapter) && (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Questions list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No questions found.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {questions.map((q, i) =>
            q.questionType === "CQ" ? (
              <SingleCqQuestion
                key={q._id}
                q={q as ICQ & { _id: string }}
                i={(page - 1) * 20 + i + 1}
              />
            ) : (
              <SingleMcqQuestion
                key={q._id}
                q={q as IMCQ & { _id: string }}
                i={(page - 1) * 20 + i + 1}
                viewMode={"showAns"}
              />
            ),
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
