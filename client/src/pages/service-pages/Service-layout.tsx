import ServiceNavbar from "@/components/service-bar/service-navbar";
import ServiceSidebar from "@/components/service-bar/service-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Calendar, Home, Inbox } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function ServiceLayout() {
  // Menu items.
  const items: any = [
    {
      title: "Question bank",
      url: "/question-bank",
      icon: <Home />,
      subItem: [],
    },
    {
      title: "Exam",
      url: "/exam",
      icon: <Inbox />,
      subItem: [],
    },
    {
      title: "Doubt",
      url: "/doubt",
      icon: <Calendar />,
      subItem: [],
    },
  ];
  return (
    <SidebarProvider>
      <div className="max-w-50">
        <ServiceSidebar items={items} />
      </div>
      <div className="w-full py-5 bg-sidebar-accent">
        <div className="w-full flex gap-4 max-md:gap-3 pl-6 pr-10 ">
          <SidebarTrigger className="mt-1 cursor-pointer" />
          <ServiceNavbar />
        </div>
        <main className="pl-6 pr-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
