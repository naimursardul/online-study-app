"use client";

import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { IBackground, ILevel, IPopulatedData, ISubject } from "@/lib/type";
import { Card } from "../ui/card";
import Link from "next/link";

export default function QbSection({
  level,
  allBackground,
  allSubject,
}: {
  level: ILevel & { _id: string };
  allBackground: (IBackground & { _id: string })[];
  allSubject: (ISubject & { _id: string })[];
}) {
  const [filter, setFilter] = useState<string>("");

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-xl">{level?.name}</h2>
      <ToggleGroup
        type="single"
        className="space-x-2"
        onValueChange={(value) => setFilter(value)}
      >
        {Array.isArray(allBackground) &&
          allBackground.map((b, i) => {
            const sid = (b?.level as unknown as IPopulatedData)?._id;
            if (sid === level?._id) {
              return (
                <ToggleGroupItem
                  value={b?._id}
                  key={i}
                  className="rounded-2xl px-4 py-4 max-md:text-xs  border-1 border-sidebar-border cursor-pointer"
                >
                  {b?.name}
                </ToggleGroupItem>
              );
            }
          })}
      </ToggleGroup>
      <div className="flex flex-wrap gap-4 border-b pb-6">
        {Array.isArray(allSubject) &&
          allSubject.map((s, i) => {
            const s_lid = (s?.level as unknown as IPopulatedData)?._id;
            const s_bid = s?.background as unknown as IPopulatedData[];
            if (
              (!filter && s_lid === level?._id) ||
              (filter &&
                s_lid === level?._id &&
                s_bid.some((b) => b?._id == filter))
            ) {
              console.log(s);
              return (
                <Link
                  key={i}
                  href={`question-bank/${
                    (s?.level as unknown as IPopulatedData)?.name
                  }_${s?.name}`}
                >
                  <Card className="flex justify-center items-center text-sm font-bold p-3 w-[140px] h-[140px] border cursor-pointer hover:opacity-70">
                    {s?.name}
                  </Card>
                </Link>
              );
            }
          })}
      </div>
    </div>
  );
}
