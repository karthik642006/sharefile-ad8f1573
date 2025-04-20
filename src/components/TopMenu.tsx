
import { Link, useLocation } from "react-router-dom";
import { Home, User, Menu, LayoutDashboard, Tag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Pricing", url: "/pricing", icon: Tag },
  { title: "About Us", url: "/about", icon: Info },
];

export function TopMenu() {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-2 px-5 bg-white shadow-sm h-16">
      <div className="flex items-center text-[#9b87f5] font-extrabold text-2xl mr-8">
        <Menu className="mr-2" size={24} /> FileLinker
      </div>
      <ul className="flex gap-3 items-center">
        {menuItems.map(item => (
          <li key={item.title}>
            <Link to={item.url}>
              <Button variant={location.pathname === item.url ? "secondary" : "ghost"} size="sm" className="flex items-center gap-1">
                <item.icon size={18} />
                {item.title}
              </Button>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

