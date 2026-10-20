import { Music2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import MobileSidebar from "./MobileSidebar";
const Header = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [username, setUsername] = useState("");
  const [initials, setInitials] = useState("");
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        const {
          data
        } = await supabase.from("profiles").select("username").eq("id", user.id).single();
        if (data) {
          setUsername(data.username);
          const words = data.username.split(" ");
          const userInitials = words.map(word => word[0]).join("").toUpperCase().slice(0, 2);
          setInitials(userInitials);
        }
      }
    };
    fetchProfile();
  }, []);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "See you soon!"
    });
    navigate("/");
  };
  return <header className="sticky top-0 z-50 w-full border-b border-primary/20 glass-effect">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <MobileSidebar />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold px-[5px] py-[5px] rounded-md bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Musicals
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/home" className={({
            isActive
          }) => `px-4 py-2 rounded-lg transition-smooth ${isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              Home
            </NavLink>
            <NavLink to="/search" className={({
            isActive
          }) => `px-4 py-2 rounded-lg transition-smooth ${isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              Search
            </NavLink>
            <NavLink to="/library" className={({
            isActive
          }) => `px-4 py-2 rounded-lg transition-smooth ${isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              Library
            </NavLink>
            <NavLink to="/my-music" className={({
            isActive
          }) => `px-4 py-2 rounded-lg transition-smooth ${isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              My Music
            </NavLink>
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-10 h-10 rounded-full p-0 gradient-primary text-white font-semibold hover:opacity-80 transition-smooth border-0">
              {initials}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-effect border-primary/20">
            <DropdownMenuItem disabled className="text-muted-foreground">
              {username}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>;
};
export default Header;