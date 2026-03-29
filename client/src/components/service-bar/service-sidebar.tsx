import { Bird } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
import type { SidebarItemType } from "@/types/types";

function ServiceSidebar({ items }: { items: SidebarItemType[] }) {
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <Sidebar collapsible="icon" className="w-50">
      <SidebarHeader className="mt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Link to={"/"} className="flex gap-3 font-semibold ">
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
                    <Link to={item.url}>
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
                            <Link className="w-full" to={subItem.url}>
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

export default ServiceSidebar;
