"use client";

import { Bird, Calendar, Home, Inbox } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Menu items.
const items = [
  {
    title: "Question bank",
    url: "/question-bank",
    icon: Home,
  },
  {
    title: "Exam",
    url: "/exam",
    icon: Inbox,
  },
  {
    title: "Doubts",
    url: "/doubts",
    icon: Calendar,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon" className="w-[200px]">
      <SidebarHeader className="mt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Link href={"/"} className="flex gap-3 font-semibold ">
                <Bird className="size-6" />
                <span className="text-[16px]">Wikeebly</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname.includes(item.url)}
                    tooltip={item.title}
                    asChild
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
