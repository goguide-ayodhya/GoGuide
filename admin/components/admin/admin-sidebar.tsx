"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Car,
  Ticket,
  CreditCard,
  TrendingUp,
  MessageSquare,
  Star,
  Settings,
  MapPin,
  X,
  Package,
  HandCoins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { getAdminDashboard, getPendingGuides, getRecentUsers } from "@/lib/api/adminDashboard";
import { getAllBookings } from "@/lib/api/bookings";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: CalendarDays,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Cabs",
    href: "/admin/cabs",
    icon: Car,
  },
  {
    title: "Packages",
    href: "/admin/packages",
    icon: Package,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Guide payouts",
    href: "/admin/guide-payouts",
    icon: HandCoins,
  },
  {
    title: "Revenue",
    href: "/admin/revenue",
    icon: TrendingUp,
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [stats, setStats] = useState({ bookings: 0, pendingGuides: 0, newUsers: 0, pendingPackages: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboard = await getAdminDashboard();
        const pending = await getPendingGuides(100);
        const allBookings = await getAllBookings();
        const packageBookings = Array.isArray(allBookings) ? allBookings : allBookings?.data || [];
        const pendingPackagesCount = packageBookings.filter((b: any) => b.bookingType === "PACKAGE" && b.status === "PENDING").length;

        
        // Count users joined today
        const users = await getRecentUsers(50);
        const today = new Date().toDateString();
        const newUsersCount = users?.filter((u: any) => new Date(u.joinedAt).toDateString() === today)?.length || 0;

        setStats({
          bookings: dashboard?.bookings?.unseen || 0,
          pendingGuides: pending?.length || 0,
          newUsers: newUsersCount,
          pendingPackages: pendingPackagesCount
        });
      } catch (err) {
        console.error("Error fetching sidebar stats", err);
      }
    };
    fetchStats();
    // Optional: add interval to refresh stats
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 fixed lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:left-0 lg:translate-x-0 lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg">
                <Image
                  src="/goguide.svg"
                  alt="GoGuide"
                  width={36}
                  height={36}
                />
              </div>
              <span className="font-semibold text-xl">GoGuide</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-white"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5",
                        isActive
                          ? "text-white"
                          : "text-muted-foreground",
                      )}
                    />
                    <span className="flex-1">{item.title}</span>
                    
                    {/* Badges */}
                    {item.title === "Bookings" && stats.bookings > 0 && (
                      <Badge className="ml-auto bg-rose-500 hover:bg-rose-600 text-white border-0 h-5 px-1.5 min-w-5 flex items-center justify-center rounded-full text-[10px]">
                        {stats.bookings}
                      </Badge>
                    )}
                    {item.title === "Cabs" && stats.pendingGuides > 0 && (
                      <Badge className="ml-auto bg-amber-500 hover:bg-amber-600 text-white border-0 h-5 px-1.5 min-w-5 flex items-center justify-center rounded-full text-[10px]">
                        {stats.pendingGuides}
                      </Badge>
                    )}
                    {item.title === "Users" && stats.newUsers > 0 && (
                      <Badge className="ml-auto bg-blue-500 hover:bg-blue-600 text-white border-0 h-5 px-1.5 min-w-5 flex items-center justify-center rounded-full text-[10px]">
                        {stats.newUsers}
                      </Badge>
                    )}
                    {item.title === "Packages" && stats.pendingPackages > 0 && (
                      <Badge className="ml-auto bg-indigo-500 hover:bg-indigo-600 text-white border-0 h-5 px-1.5 min-w-5 flex items-center justify-center rounded-full text-[10px]">
                        {stats.pendingPackages}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
}
