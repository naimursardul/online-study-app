import Link from "next/link";

function SideBarLink({ slug }: { slug: string }) {
  return (
    <Link
      className={`hover:bg-muted px-3 py-2 rounded-lg border-none outline-none ${
        slug === "43239283" && "bg-muted font-semibold"
      }`}
      href={"43239283"}
    >
      Engineering Weekly(Written) - 2
    </Link>
  );
}

export default function SingleQuestionBankSidebar({ slug }: { slug: string }) {
  return (
    <div className="md:sticky top-[5px] md:min-w-[190px] md:max-h-[calc(100vh-15px)] bg-background rounded-lg px-4 py-5 border border-sidebar-border">
      <form action="" className="h-[50px] ">
        <input
          type="text"
          placeholder="Search"
          className="w-full h-[32px] text-sm border-1 border-border rounded-lg outline-none px-3 "
        />
      </form>
      <div className="md:overflow-y-auto max-md:overflow-x-auto md:h-[calc(100vh-110px)] flex md:flex-col gap-2 text-sm max-md:text-xs  ">
        <Link
          className={`hover:bg-muted px-3 py-2 rounded-lg border-none outline-none ${
            slug === "24747220" && "bg-muted font-semibold"
          }`}
          href={"24747220"}
        >
          Engineering Weekly(MCQ) - 1
        </Link>
        <Link
          className={`hover:bg-muted px-3 py-2 rounded-lg border-none outline-none ${
            slug === "34754354" && "bg-muted font-semibold"
          }`}
          href={"34754354"}
        >
          Engineering Weekly(MCQ) - 2
        </Link>
        <Link
          className={`hover:bg-muted px-3 py-2 rounded-lg border-none outline-none ${
            slug === "84834983" && "bg-muted font-semibold"
          }`}
          href={"84834983"}
        >
          Engineering Weekly(Written) - 1
        </Link>
        <Link
          className={`hover:bg-muted px-3 py-2 rounded-lg border-none outline-none ${
            slug === "43239283" && "bg-muted font-semibold"
          }`}
          href={"43239283"}
        >
          Engineering Weekly(Written) - 2
        </Link>
        <SideBarLink slug={slug} />
        <SideBarLink slug={slug} />
        <SideBarLink slug={slug} />
        <SideBarLink slug={slug} />
        <SideBarLink slug={slug} />
        <SideBarLink slug={slug} />
      </div>
    </div>
  );
}
