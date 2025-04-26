
import { Link, useLocation } from "react-router-dom";
import { Home, User, Menu, LayoutDashboard, Tag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Pricing", url: "/pricing", icon: Tag },
  { title: "About Us", url: "/about", icon: Info },
];

export function TopMenu() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="flex flex-col px-5 bg-white shadow-sm py-3">
      <div className="flex items-center text-[#9b87f5] font-extrabold text-xl md:text-2xl mb-6">
        <Menu className="mr-2" size={24} /> sharefile.lovable.app
      </div>
      <div className="flex justify-start items-center space-x-4">
        {menuItems.map(item => (
          <Link key={item.title} to={item.url}>
            <Button 
              variant={location.pathname === item.url ? "secondary" : "ghost"} 
              size="sm" 
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <item.icon size={24} />
              <span className="text-sm">{item.title}</span>
            </Button>
          </Link>
        ))}
        {!user && (
          <>
            <Link to="/login">
              <Button 
                variant={location.pathname === "/login" ? "secondary" : "ghost"} 
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <User size={24} />
                <span className="text-sm">Login</span>
              </Button>
            </Link>
            <Link to="/signup">
              <Button 
                variant={location.pathname === "/signup" ? "secondary" : "default"} 
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-2 bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
              >
                <User size={24} />
                <span className="text-sm">Sign Up</span>
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
