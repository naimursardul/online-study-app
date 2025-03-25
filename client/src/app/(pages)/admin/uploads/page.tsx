import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function page() {
  return (
    <Button>
      <Link href={"uploads/question"}>Question</Link>
    </Button>
  );
}
