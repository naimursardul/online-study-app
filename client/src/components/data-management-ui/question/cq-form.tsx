"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ICQ, ITopic } from "@/lib/type";

export default function CqForm({
  formData,
  setFormData,
  defaultTopicId,
}: {
  formData: ICQ;
  setFormData: React.Dispatch<React.SetStateAction<ICQ>>;
  defaultTopicId: string;
}) {
  const [topics, setTopics] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    async function getOptions() {
      if (formData?.chapter) {
        const query = [
          formData?.levelId,
          [...formData?.backgroundId],
          formData?.subjectId,
          formData?.chapterId,
        ];
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/topic${
              query?.length > 0 ? "?" + query.join("&") : ""
            }`
          );
          const data = await res.json();

          if (data.success) {
            setTopics(
              data?.data?.map((t: ITopic & { _id: string }) => {
                return { _id: t?._id, name: t?.name };
              })
            );
          }
        } catch (error) {
          console.log(error);
        }
      }
    }

    getOptions();
  }, [formData]);

  useEffect(() => {
    if (!defaultTopicId) return;

    setFormData((prev) => {
      if (!Array.isArray(prev.subQuestions) || prev.subQuestions.length !== 4) {
        return prev;
      }

      const newSubQuestions = prev.subQuestions.map((sq) => ({
        ...sq,
        topicId: prev.topicId,
        topic: prev.topic,
      }));

      return { ...prev, subQuestions: newSubQuestions };
    });
  }, [defaultTopicId]);

  return (
    <>
      <div className="space-y-2">
        <Label>Statement</Label>
        <Textarea
          placeholder="Enter option statement"
          name="statement"
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, statement: e.target.value }))
          }
        />
      </div>

      <div className="space-y-4">
        <Label>Sub Questions</Label>
        <div className="space-y-6">
          {["A", "B", "C", "D"].map((_sq, i) => (
            <div className="space-y-4  pl-3" key={i}>
              <Label className="font-normal">Question No: {_sq}</Label>
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label className="font-light">Topic</Label>
                  <Select
                    value={
                      defaultTopicId && formData?.subQuestions
                        ? formData?.subQuestions[i].topicId +
                          "," +
                          formData?.subQuestions[i].topic
                        : undefined
                    }
                    onValueChange={(value) => {
                      const { subQuestions } = formData;
                      if (Array.isArray(subQuestions)) {
                        subQuestions[i].topicId = value.split(",")[0];
                        subQuestions[i].topic = value.split(",")[1];
                        return setFormData((prev) => ({
                          ...prev,
                          subQuestions,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder={`Select topic`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {topics?.length > 0 ? (
                          topics.map((_o, i) => (
                            <SelectItem
                              className="cursor-pointer"
                              key={i}
                              value={_o?._id + "," + _o?.name}
                            >
                              {_o?.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="No-val" disabled>
                            No topic found.
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-light">Question</Label>
                  <Textarea
                    placeholder={`Enter question ${_sq}`}
                    name={`question${_sq}`}
                    onChange={(e) => {
                      const { subQuestions } = formData;
                      subQuestions[i].question = e.target.value;
                      return setFormData((prev) => ({
                        ...prev,
                        subQuestions,
                      }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-light">Answer</Label>
                  <Textarea
                    placeholder={`Enter answer ${_sq}`}
                    name={`answer${_sq}`}
                    onChange={(e) => {
                      const { subQuestions } = formData;
                      subQuestions[i].answer = e.target.value;
                      return setFormData((prev) => ({ ...prev, subQuestions }));
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
