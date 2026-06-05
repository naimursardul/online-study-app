import ServiceNavbar from "@/components/service-bar/service-navbar";
import SidebarTemplate from "@/components/sidebar-template/SidebarTemplate";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { SidebarItemType } from "@/types/types";
import { Calendar, Home, Inbox, LayoutDashboard } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function ServiceLayout() {
  // Menu items.
  const items: SidebarItemType[] = [
    {
      title: "Question bank",
      url: "/question-bank",
      icon: <Home />,
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
  ];

  return (
    <SidebarProvider>
      <div className="max-w-50">
        <SidebarTemplate items={items} />
      </div>
      <div className="w-full py-5 bg-sidebar-accent">
        <div className="w-full flex gap-4 max-md:gap-3 pl-6 pr-10 ">
          <SidebarTrigger className="mt-1 cursor-pointer" />
          <ServiceNavbar items={items} />
        </div>
        <main className="pl-6 pr-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
