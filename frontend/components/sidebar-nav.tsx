"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  BarChart3,
  Calendar,
  Users,
  PieChart,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/guide/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/guide/dashboard/bookings", label: "Bookings", icon: Calendar },
  { href: "/guide/dashboard/guides", label: "Guides", icon: Users },
  { href: "/guide/dashboard/earnings", label: "Earnings", icon: PieChart },
  { href: "/guide/dashboard/profile", label: "Profile", icon: User },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    logout();
    setIsOpen(false);
    router.push("/login");
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Mobile Toggle Button - Only visible on small screens when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 transition-colors shadow-lg"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Mobile Overlay Backdrop - closes sidebar when clicked */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out",
          // Desktop: fixed position
          "md:fixed md:left-0 md:top-0 md:h-screen md:z-40",
          // Mobile: overlay with animation
          "fixed left-0 top-0 h-screen z-50 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo/Branding Area */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between flex-shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-sidebar-primary tracking-tight">
              TourGuide
            </h1>
            <p className="text-xs font-medium text-sidebar-foreground/50">
              Pro Platform
            </p>
          </div>

          {/* Close Button - Mobile only */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 hover:bg-sidebar-accent/50 rounded-lg transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground"
            aria-label="Close navigation menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium text-sm",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar/50 flex-shrink-0">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3 h-11 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span className="truncate">Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
