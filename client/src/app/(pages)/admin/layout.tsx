import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { LayoutDashboard, Upload, User } from "lucide-react";
import { SidebarItemType } from "@/lib/type";

export default function Layout({ children }: { children: React.ReactNode }) {
  // Menu items.
  const items: SidebarItemType[] = [
    {
      title: "Uploads",
      url: "/admin/uploads",
      icon: <Upload />,
      subItem: [
        { title: "Question", url: "/admin/uploads/question" },
        { title: "Record", url: "/admin/uploads/record" },
        { title: "Class", url: "/admin/uploads/class" },
        { title: "Subject", url: "/admin/uploads/subject" },
        { title: "Chapter", url: "/admin/uploads/chapter" },
        { title: "Topic", url: "/admin/uploads/topic" },
      ],
    },
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: <LayoutDashboard />,
      subItem: [],
    },
    {
      title: "User",
      url: "/admin/user",
      icon: <User />,
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
        </div>
        <main className="pl-6 pr-6 py-5">{children}</main>
      </div>
    </SidebarProvider>
  );
}
