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
function SidebarTemplate({ items }: { items: SidebarItemType[] }) {
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <Sidebar collapsible="icon" className="w-50">
      <SidebarHeader className="mt-3">
        {/* Rendered outside SidebarMenuButton on purpose: that renders a
            <button>, and SiteBrand is a <Link>. */}
        <SidebarMenuButton>
          <Link to="/" className="w-full flex gap-2">
            <img
              src="/favicon.svg"
              alt=""
              aria-hidden="true"
              className="size-6"
            />

            <span className="text-base font-semibold tracking-tight text-foreground">
              Poruya
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Every item is shown to every visitor: `item.role` is not a
                  visibility gate. ProtectedRoute sends guests to /login, which
                  is the discovery path we want. */}
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
                  {item?.subItem &&
                    item.subItem.length > 0 &&
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

export default SidebarTemplate;
