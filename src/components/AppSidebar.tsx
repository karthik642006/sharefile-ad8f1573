import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Home, User, LayoutDashboard, Tag, Info } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
const sidebarItems = [{
  title: "Home",
  url: "/",
  icon: Home
}, {
  title: "Profile",
  url: "/profile",
  icon: User
}, {
  title: "Dashboard",
  url: "/dashboard",
  icon: LayoutDashboard
}, {
  title: "Pricing",
  url: "/pricing",
  icon: Tag
}, {
  title: "About Us",
  url: "/about",
  icon: Info
}];
export function AppSidebar() {
  const location = useLocation();
  return <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${location.pathname === item.url ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted"}`}>
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}