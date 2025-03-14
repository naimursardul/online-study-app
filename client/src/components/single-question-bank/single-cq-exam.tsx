"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Bookmark, BookmarkCheck, ChevronsUpDown } from "lucide-react";
import { QuestionType } from "@/app/(pages)/(services)/question-bank/[subject]/[slug]/page";
import { Button } from "../ui/button";

export default function SingleCqQuestion({
  q,
  i,
}: {
  q: QuestionType;
  i: number;
}) {
  // const [isOpen, setIsOpen] = useState(false);

  const [isMarked, setIsMarked] = useState<boolean>(false);

  return (
    <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-sidebar-border">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 justify-between ">
          <p className="bg-input h-[26px] flex items-center px-2 py-2 text-xs rounded">
            {i}
          </p>
          <p className="w-full max-sm:text-sm">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Porro,
            natus. Molestiae ipsa delectus nobis molestias, nam repudiandae,
            illum voluptate consectetur architecto sit reiciendis quaerat sunt
            labore perspiciatis! Eos voluptas molestias ipsa, magnam quod ex
            nulla!
          </p>
          <Button
            onClick={() => setIsMarked(!isMarked)}
            variant={"ghost"}
            size={"icon"}
            className="cursor-pointer"
          >
            {isMarked ? (
              <BookmarkCheck className="text-destructive" />
            ) : (
              <Bookmark />
            )}
          </Button>
        </div>
        {q?.tag?.length > 0 && (
          <div className="flex justify-end ">
            <p className="bg-sidebar-accent px-2 py-2 text-chart-2 text-xs max-sm:text-[11px] font-bold rounded">
              {q.tag.join(", ")}
            </p>
          </div>
        )}

        <Collapsible className=" border-1 pb-1 px-2 py-2 rounded">
          <div className="flex justify-between gap-2 ">
            <span>{"A)"}</span>
            <p className="w-full">
              Lorem ipsum dolor sit amet consectetur adipisicing elit?
            </p>
            <CollapsibleTrigger className="cursor-pointer rounded ">
              <ChevronsUpDown className="size-5 max-sm:size-4 hover:bg-sidebar-accent p-[2px]" />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="px-4 py-3 max-sm:text-sm text-chart-2">
            {q?.explanation}
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="border-1 pb-1 px-2 py-2 rounded">
          <div className="flex justify-between gap-2 ">
            <span>{"B)"}</span>
            <p className="w-full">
              Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem
              ipsum dolor sit amet consectetur adipisicing elit?
            </p>
            <CollapsibleTrigger className="cursor-pointer rounded ">
              <ChevronsUpDown className="size-5 max-sm:size-4 hover:bg-sidebar-accent p-[2px]" />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="px-4 py-3 max-sm:text-sm text-chart-2">
            {q?.explanation}
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="border-1 pb-1 px-2 py-2 rounded">
          <div className="flex justify-between gap-2 ">
            <span>{"C)"}</span>
            <p className="w-full">
              Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem
              ipsum dolor sit amet consectetur adipisicing elit?
            </p>
            <CollapsibleTrigger className="cursor-pointer rounded ">
              <ChevronsUpDown className="size-5 max-sm:size-4 hover:bg-sidebar-accent p-[2px]" />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="px-4 py-3 max-sm:text-sm text-chart-2">
            {q?.explanation}
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="border-1 pb-1 px-2 py-2 rounded">
          <div className="flex justify-between gap-2 ">
            <span>{"D)"}</span>
            <p className="w-full">
              Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem
              ipsum dolor sit amet consectetur adipisicing elit?
            </p>
            <CollapsibleTrigger className="cursor-pointer rounded ">
              <ChevronsUpDown className="size-5 max-sm:size-4 hover:bg-sidebar-accent p-[2px]" />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="px-4 py-3 max-sm:text-sm text-chart-2">
            {q?.explanation}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
