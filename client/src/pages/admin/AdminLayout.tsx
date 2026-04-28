import SidebarTemplate from "@/components/sidebar-template/SidebarTemplate";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { IMasterData, SidebarItemType } from "@/types/types";
import { LayoutDashboard, Upload, User } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { client } from "@/lib/utils";

export default function AdminLayout() {
  const [masterData, setMasterData] = useState<IMasterData>({
    levels: [],
    backgrounds: [],
    subjects: [],
    chapters: [],
    topics: [],
    records: [],
  });

  const [loading, setLoading] = useState(true);

  const items: SidebarItemType[] = [
    {
      title: "Uploads",
      url: "/admin/uploads",
      icon: <Upload />,
      subItem: [
        { title: "Question", url: "/admin/question" },
        { title: "Record", url: "/admin/record" },
        { title: "Level", url: "/admin/level" },
        { title: "Background", url: "/admin/background" },
        { title: "Subject", url: "/admin/subject" },
        { title: "Chapter", url: "/admin/chapter" },
        { title: "Topic", url: "/admin/topic" },
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

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const res = await client.get("/master-data");

        setMasterData(res.data.data);
      } catch (error) {
        console.error("Master data fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  return (
    <SidebarProvider>
      <div className="max-w-50">
        <SidebarTemplate items={items} />
      </div>

      <div className="w-full py-5 bg-sidebar-accent">
        <div className="w-full flex gap-4 max-md:gap-3 pl-6 pr-10">
          <SidebarTrigger className="mt-1 cursor-pointer" />
        </div>

        <main className="mx-6 my-6">
          {loading ? <p>Loading...</p> : <Outlet context={masterData} />}
        </main>
      </div>
    </SidebarProvider>
  );
}
