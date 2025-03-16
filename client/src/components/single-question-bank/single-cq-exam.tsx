"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Bookmark, BookmarkCheck, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";

export default function SingleCqQuestion() {
  const [isMarked, setIsMarked] = useState<boolean>(false);

  return (
    <div className="bg-background rounded-xl p-5 max-sm:p-4 border border-sidebar-border">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 justify-between items-start ">
          <p className="bg-input size-5 md:size-7 flex justify-center items-center px-2 py-2 text-xs rounded">
            1
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
        <p className="w-full max-sm:text-sm">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Porro,
          natus. Molestiae ipsa delectus nobis molestias, nam repudiandae, illum
          voluptate consectetur architecto sit reiciendis quaerat sunt labore
          perspiciatis! Eos voluptas molestias ipsa, magnam quod ex nulla!
        </p>
        <div className="flex justify-end ">
          <p className="bg-sidebar-accent px-2 py-2 text-chart-2 text-xs max-sm:text-[11px] font-bold rounded">
            Dhaka-2024, Rajshahi-2020
          </p>
        </div>

        <Collapsible className="border-1 pl-3 pr-2 py-2 rounded">
          <div className="flex justify-between gap-2 ">
            <span className="font-semibold text-chart-2">{"(A)"}</span>
            <p className="w-full">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>
            <CollapsibleTrigger className="cursor-pointer rounded ">
              <ChevronsUpDown className="size-5 max-sm:size-4 hover:bg-sidebar-accent p-[2px]" />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="px-4 py-3 max-sm:text-sm text-chart-2">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Explicabo
            dicta quos ea accusantium! Minima, ab.
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="border-1 pl-3 pr-2 py-2 rounded">
          <div className="flex justify-between gap-2 ">
            <span className="font-semibold text-chart-2">{"(B)"}</span>
            <p className="w-full">
              Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem
              ipsum dolor sit amet consectetur adipisicing elit?
            </p>
            <CollapsibleTrigger className="cursor-pointer rounded ">
              <ChevronsUpDown className="size-5 max-sm:size-4 hover:bg-sidebar-accent p-[2px]" />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="px-4 py-3 max-sm:text-sm text-chart-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet
            consectetur iure ullam veniam facilis eum dignissimos quae similique
            ipsum? Alias.
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="border-1 pl-3 pr-2 py-2 rounded">
          <div className="flex justify-between gap-2 ">
            <span className="font-semibold text-chart-2">{"(C)"}</span>
            <p className="w-full">
              Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem
              ipsum dolor sit amet consectetur adipisicing elit?
            </p>
            <CollapsibleTrigger className="cursor-pointer rounded ">
              <ChevronsUpDown className="size-5 max-sm:size-4 hover:bg-sidebar-accent p-[2px]" />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="px-4 py-3 max-sm:text-sm text-chart-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet
            consectetur iure ullam veniam facilis eum dignissimos quae similique
            ipsum? Alias.
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="border-1 pl-3 pr-2 py-2 rounded">
          <div className="flex justify-between gap-2 ">
            <span className="font-semibold text-chart-2">{"(D)"}</span>
            <p className="w-full">
              Lorem ipsum dolor sit amet consectetur adipisicing elit Lorem
              ipsum dolor sit amet consectetur adipisicing elit?
            </p>
            <CollapsibleTrigger className="cursor-pointer rounded ">
              <ChevronsUpDown className="size-5 max-sm:size-4 hover:bg-sidebar-accent p-[2px]" />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="px-4 py-3 max-sm:text-sm text-chart-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet
            consectetur iure ullam veniam facilis eum dignissimos quae similique
            ipsum? Alias.
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
