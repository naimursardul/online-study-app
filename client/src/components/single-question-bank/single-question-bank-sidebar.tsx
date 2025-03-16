import Link from "next/link";

function SideBarLink() {
  return (
    <Link
      className={`hover:bg-muted px-3 py-2 rounded-lg border-none outline-none `}
      href={"mcq-dhaka-2024"}
    >
      Engineering Weekly(Written) - 2
    </Link>
  );
}

export default function SingleQuestionBankSidebar() {
  return (
    <div className="md:sticky top-[5px] md:min-w-[190px] md:max-h-[calc(100vh-15px)] bg-background rounded-lg px-4 py-5 border border-sidebar-border">
      <form action="" className="h-[50px] ">
        <input
          type="text"
          placeholder="Search"
          className="w-full h-[32px] text-sm border-1 border-border rounded-lg outline-none px-3 "
        />
      </form>
      <div className="md:overflow-y-auto max-md:overflow-x-auto md:h-[calc(100vh-110px)] flex md:flex-col gap-2 text-[13px] max-md:text-xs  ">
        <Link
          className={`hover:bg-muted px-3 py-2 rounded-lg border-none outline-none `}
          href={"mcq-dhaka-2024"}
        >
          Board Weekly(MCQ) - 1
        </Link>
        <Link
          className={`hover:bg-muted px-3 py-2 rounded-lg border-none outline-none `}
          href={"cq-dhaka-2024"}
        >
          Board Weekly(CQ) - 2
        </Link>
        <Link
          className={`hover:bg-muted px-3 py-2 rounded-lg border-none outline-none `}
          href={"mcq-dhaka-2024"}
        >
          Engineering Weekly(Written) - 1
        </Link>
        <Link
          className={`hover:bg-muted px-3 py-2 rounded-lg border-none outline-none `}
          href={"cq-dhaka-2024"}
        >
          Engineering Weekly(Written) - 2
        </Link>
        <SideBarLink />
        <SideBarLink />
        <SideBarLink />
        <SideBarLink />
        <SideBarLink />
        <SideBarLink />
      </div>
    </div>
  );
}
