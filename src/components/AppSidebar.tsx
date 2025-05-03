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
      
    </Sidebar>;
}