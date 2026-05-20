import ServiceNavbar from "@/components/service-bar/service-navbar";
import SidebarTemplate from "@/components/sidebar-template/SidebarTemplate";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { IMasterData } from "@/types/types";
import { client } from "@/utils/utils";
import { Calendar, Home, Inbox } from "lucide-react";
import { useEffect, useState } from "react";
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

  const [masterData, setMasterData] = useState<IMasterData>({
    levels: [],
    backgrounds: [],
    subjects: [],
    chapters: [],
    topics: [],
    records: [],
  });
  const [loading, setLoading] = useState(true);

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
        <div className="w-full flex gap-4 max-md:gap-3 pl-6 pr-10 ">
          <SidebarTrigger className="mt-1 cursor-pointer" />
          <ServiceNavbar />
        </div>
        <main className="pl-6 pr-6">
          <Outlet context={masterData} />
        </main>
      </div>
    </SidebarProvider>
  );
}
