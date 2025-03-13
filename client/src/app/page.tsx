import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Link
        className="flex gap-2 items-center hover:opacity-80 cursor-pointer bg-foreground text-background font-semibold px-4 py-3 rounded-2xl"
        href={"/question-bank"}
      >
        <span>Question bank</span>
        <ArrowRight />
      </Link>
    </div>
  );
}
