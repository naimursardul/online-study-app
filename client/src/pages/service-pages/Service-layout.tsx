import Loader from "@/components/loader/Loader";
import SidebarTemplate from "@/components/sidebar-template/SidebarTemplate";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useMasterData } from "@/lib/MasterData-context";
import ApiErrorState from "@/components/shared/ApiErrorState";
import type { SidebarItemType } from "@/types/types";
import {
  Calendar,
  Home,
  Inbox,
  LayoutDashboard,
  Library,
  Search,
} from "lucide-react";
import { Outlet } from "react-router-dom";
import NavbarAuth from "@/components/NavbarAuth/NavbarAuth";

export default function ServiceLayout() {
  // Menu items.
  const items: SidebarItemType[] = [
    {
      title: "Question-bank",
      url: "/question-bank",
      icon: <Home />,
    },
    {
      title: "Question Explorer",
      url: "/question-explorer",
      icon: <Search />,
      role: ["user", "admin", "super-admin"],
    },
    {
      title: "Exam",
      url: "/exam",
      icon: <Inbox />,
    },
    {
      title: "Doubt",
      url: "/doubt",
      icon: <Calendar />,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard />,
      role: ["user", "admin"],
    },
    {
      title: "Collection",
      url: "/collection",
      icon: <Library />,
      role: ["user", "admin"],
    },
  ];

  const { masterDataLoading, masterDataError, refetchMasterData } =
    useMasterData();
  return (
    <SidebarProvider>
      <div className="max-w-50">
        <SidebarTemplate items={items} />
      </div>
      <div className="w-full py-5 bg-sidebar-accent">
        <div className="w-full flex gap-4 justify-between items-center max-md:gap-3 pl-6 pr-10 ">
          <SidebarTrigger className="mt-1 cursor-pointer" />
          {/* <ServiceNavbar items={items} />    */}
          <NavbarAuth />
        </div>
        <main className="mx-6 mt-8 mb-16">
          {masterDataLoading ? (
            <Loader />
          ) : masterDataError ? (
            // Every service page's dropdowns and slugs resolve against master
            // data; a failed fetch used to render them silently empty.
            <ApiErrorState
              message={masterDataError}
              onRetry={refetchMasterData}
            />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
