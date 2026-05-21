import type { SidebarItemType } from "@/types/types";
import NavbarAuth from "../NavbarAuth/NavbarAuth";
import { useLocation } from "react-router-dom";

export default function ServiceNavbar({ items }: { items: SidebarItemType[] }) {
  const location = useLocation();
  const pathname = location.pathname;
  const pathTitle = items.filter((i) => pathname.includes(i.url))[0]?.title;

  return (
    <div className="w-full flex justify-between items-center gap-2">
      <h2 className="text-2xl max-md:text-xl font-semibold">
        {pathTitle || "Question Bank"}
      </h2>
      <NavbarAuth />
    </div>
  );
}
