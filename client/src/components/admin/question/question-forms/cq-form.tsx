import React, { useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ICQ } from "@/types/types";
import { useMasterData } from "@/lib/MasterData-context";
import TextEditor from "@/components/text-editor/TextEditor";

export default function CqForm({
  formData,
  setFormData,
}: {
  formData: ICQ;
  setFormData: React.Dispatch<React.SetStateAction<ICQ>>;
}) {
  const { masterData } = useMasterData();

  // Initialize subquestions with parent chapter/topic
  useEffect(() => {
    if (!formData.chapterId) return;

    setFormData((prev) => ({
      ...prev,
      subQuestions: prev.subQuestions?.map((sq) => ({
        ...sq,
        chapterId: prev.chapterId,
        topicId: prev.topicId,
      })),
    }));
  }, [formData.chapterId, formData.topicId]);

  // Available chapters from parent subject
  const chapterOptions = useMemo(() => {
    if (!formData.subjectId) return [];
    return masterData.chapters.filter(
      (chapter) => chapter?.subjectId === formData.subjectId,
    );
  }, [masterData.chapters, formData.subjectId]);

  // Topic options from parent chapter
  const topicOptionsMap = useMemo(() => {
    return (formData.subQuestions ?? []).map((sq) =>
      masterData.topics.filter((topic) => topic.chapterId === sq.chapterId),
    );
  }, [masterData.topics, formData.subQuestions]);

  const handleChapterChange = (index: number, chapterId: string) => {
    setFormData((prev) => ({
      ...prev,
      subQuestions: prev.subQuestions.map((sq, idx) =>
        idx === index
          ? {
              ...sq,
              chapterId,
              topicId: "",
            }
          : sq,
      ),
    }));
  };

  const handleTopicChange = (index: number, topicId: string) => {
    setFormData((prev) => ({
      ...prev,
      subQuestions: prev.subQuestions.map((sq, idx) =>
        idx === index ? { ...sq, topicId } : sq,
      ),
    }));
  };

  console.log(formData);
  return (
    <>
      <div className="space-y-2">
        <Label>Statement</Label>
        <TextEditor
          onChangeFn={(val) =>
            setFormData((prev) => ({
              ...prev,
              statement: val,
            }))
          }
        />
      </div>

      <div className="space-y-4">
        <Label>Sub Questions</Label>

        <div className="space-y-8">
          {(formData?.subQuestions || []).map((_, i) => {
            const label = ["A", "B", "C", "D"][i];

            return (
              <div key={i} className="space-y-4 pl-3">
                <Label>
                  Question No:{" "}
                  <span className="font-bold bg-accent-foreground text-accent p-1 rounded">
                    {label}
                  </span>
                </Label>

                <div className="space-y-4">
                  {/* Chapter */}
                  <div className="space-y-2">
                    <Label className="font-light">Chapter</Label>

                    <Select
                      value={formData.subQuestions?.[i]?.chapterId || ""}
                      onValueChange={(value) => handleChapterChange(i, value)}
                      disabled={!formData.subjectId}
                    >
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder="Select chapter" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectGroup>
                          {chapterOptions.length > 0 &&
                            chapterOptions.map((chapter) => (
                              <SelectItem key={chapter._id} value={chapter._id}>
                                {chapter.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Topic */}
                  <div className="space-y-2">
                    <Label className="font-light">Topic</Label>

                    <Select
                      value={formData.subQuestions?.[i]?.topicId || ""}
                      onValueChange={(value) => handleTopicChange(i, value)}
                      disabled={topicOptionsMap[i]?.length === 0}
                    >
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder={"Select topic"} />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectGroup>
                          {topicOptionsMap[i]?.length > 0 &&
                            topicOptionsMap[i].map((topic) => (
                              <SelectItem key={topic._id} value={topic._id}>
                                {topic.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Question */}
                  <div className="space-y-2">
                    <Label className="font-light">Question</Label>

                    <TextEditor
                      onChangeFn={(val) => {
                        setFormData((prev) => ({
                          ...prev,
                          subQuestions: prev.subQuestions.map((sq, idx) =>
                            idx === i
                              ? {
                                  ...sq,
                                  question: val,
                                }
                              : sq,
                          ),
                        }));
                      }}
                    />
                  </div>

                  {/* Answer */}
                  <div className="space-y-2">
                    <Label className="font-light">Answer</Label>

                    <TextEditor
                      onChangeFn={(val) => {
                        setFormData((prev) => ({
                          ...prev,
                          subQuestions: prev.subQuestions.map((sq, idx) =>
                            idx === i
                              ? {
                                  ...sq,
                                  answer: val,
                                }
                              : sq,
                          ),
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
