import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Search, Library, Music } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

const MobileSidebar = () => {
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/library", icon: Library, label: "Library" },
    { to: "/my-music", icon: Music, label: "My Music" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 glass-effect border-primary/20">
        <nav className="flex flex-col gap-2 mt-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
