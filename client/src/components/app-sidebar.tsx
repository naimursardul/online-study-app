"use client";

import { Bird } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarItemType } from "@/lib/type";

export function AppSidebar({ items }: { items: SidebarItemType[] }) {
  const pathname = usePathname();
  console.log(pathname);
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
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.subItem.length > 0 &&
                    item.subItem.map((subItem) => (
                      <SidebarMenuSub key={subItem.title}>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={subItem.url === pathname}
                            asChild
                          >
                            <Link className="w-full" href={subItem.url}>
                              {subItem.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    ))}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
