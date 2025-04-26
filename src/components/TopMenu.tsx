
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
    <nav className="px-5 bg-white shadow-sm py-2">
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="text-[#9b87f5] font-extrabold text-xl md:text-2xl mb-2 sm:mb-0">
          <div className="flex items-center">
            <Menu className="mr-2" size={24} /> sharefile.lovable.app
          </div>
        </div>
        <div className="flex overflow-x-auto py-1 sm:ml-6 items-center">
          {menuItems.map(item => (
            <Link key={item.title} to={item.url} className="mx-1">
              <Button 
                variant={location.pathname === item.url ? "secondary" : "ghost"} 
                size="sm" 
                className="flex flex-col items-center h-auto py-2 px-2"
              >
                <item.icon size={20} />
                <span className="text-xs mt-1">{item.title}</span>
              </Button>
            </Link>
          ))}
          {!user && (
            <>
              <Link to="/login" className="mx-1">
                <Button 
                  variant={location.pathname === "/login" ? "secondary" : "ghost"} 
                  size="sm"
                  className="flex flex-col items-center h-auto py-2 px-2"
                >
                  <User size={20} />
                  <span className="text-xs mt-1">Login</span>
                </Button>
              </Link>
              <Link to="/signup" className="mx-1">
                <Button 
                  variant={location.pathname === "/signup" ? "secondary" : "default"} 
                  size="sm"
                  className="flex flex-col items-center h-auto py-2 px-2 bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
                >
                  <User size={20} />
                  <span className="text-xs mt-1">Sign Up</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
