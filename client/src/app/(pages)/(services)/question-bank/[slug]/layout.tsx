import SingleQuestionBankSidebar from "@/components/single-question-bank/single-question-bank-sidebar";

export default async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="flex flex-col md:flex-row gap-3 mt-10">
      <SingleQuestionBankSidebar slug={slug} />
      <main className="w-full">{children}</main>
    </div>
  );
}
