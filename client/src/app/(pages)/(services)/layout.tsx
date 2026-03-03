export const revalidate = 0;
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ServiceNavbar from "@/components/service-navbar";
import { Calendar, Home, Inbox } from "lucide-react";
import { SidebarItemType } from "@/lib/type";

export default function Layout({ children }: { children: React.ReactNode }) {
  // Menu items.
  console.log("Layout rendered at", Date.now());
  const items: SidebarItemType[] = [
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
      title: "Doubts",
      url: "/doubts",
      icon: <Calendar />,
      subItem: [],
    },
  ];
  return (
    <SidebarProvider>
      <div className="max-w-[200px]">
        <AppSidebar items={items} />
      </div>
      <div className="w-full py-5 bg-sidebar-accent">
        <div className="w-full flex gap-4 max-md:gap-3 pl-6 pr-10 ">
          <SidebarTrigger className="mt-1 cursor-pointer" />
          <ServiceNavbar />
        </div>
        <main className="pl-6 pr-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
