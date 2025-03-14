import Link from "next/link";

export default async function page({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  return (
    <div>
      Subject
      <Link href={`/question-bank/${subject}/24747220`}>GO</Link>
    </div>
  );
}
