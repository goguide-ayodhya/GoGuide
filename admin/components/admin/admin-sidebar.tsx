"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CreditCard,
  TrendingUp,
  Settings,
  X,
  Package,
  HandCoins,
  DollarSign,
  MessageSquare,
  Star,
  ClipboardList,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { getRecentUsers, getAdminSidebarCounts } from "@/lib/api/adminDashboard";
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
    title: "Messages",
    href: "/admin/messages",
    icon: MessageSquare,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Packages",
    href: "/admin/packages",
    icon: Package,
  },
  {
    title: "Guide Bookings",
    href: "/admin/bookings",
    icon: CalendarDays,
  },
  {
    title: "Cab Bookings",
    href: "/admin/cab-bookings",
    icon: ClipboardList,
  },
  {
    title: "Upcoming Bookings",
    href: "/admin/upcoming-bookings",
    icon: Clock,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Revenue",
    href: "/admin/revenue",
    icon: TrendingUp,
  },
  {
    title: "Guide payouts",
    href: "/admin/guide-payouts",
    icon: HandCoins,
  },
  {
    title: "Driver Collections",
    href: "/admin/drivers/collections",
    icon: DollarSign,
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
  const [stats, setStats] = useState({
    packagesCount: 0,
    guidesCount: 0,
    cabsCount: 0,
    paymentsCount: 0,
    upcomingCount: 0,
    newUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [countsData, users] = await Promise.all([
          getAdminSidebarCounts(),
          getRecentUsers(50),
        ]);

        const today = new Date().toDateString();
        const newUsersCount = users?.filter((u: any) => new Date(u.joinedAt).toDateString() === today)?.length || 0;

        setStats({
          packagesCount: countsData?.packagesCount || 0,
          guidesCount: countsData?.guidesCount || 0,
          cabsCount: countsData?.cabsCount || 0,
          paymentsCount: countsData?.paymentsCount || 0,
          upcomingCount: countsData?.upcomingCount || 0,
          newUsers: newUsersCount,
        });
      } catch (err) {
        console.error("Error fetching sidebar stats", err);
      }
    };
    fetchStats();
    // Refresh stats every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
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
                    {item.title === "Packages" && stats.packagesCount > 0 && (
                      <Badge className="ml-auto bg-indigo-500 hover:bg-indigo-600 text-white border-0 h-5 px-1.5 min-w-5 flex items-center justify-center rounded-full text-[10px]">
                        {stats.packagesCount}
                      </Badge>
                    )}
                    {item.title === "Guide Bookings" && stats.guidesCount > 0 && (
                      <Badge className="ml-auto bg-rose-500 hover:bg-rose-600 text-white border-0 h-5 px-1.5 min-w-5 flex items-center justify-center rounded-full text-[10px]">
                        {stats.guidesCount}
                      </Badge>
                    )}
                    {item.title === "Cab Bookings" && stats.cabsCount > 0 && (
                      <Badge className="ml-auto bg-amber-500 hover:bg-amber-600 text-white border-0 h-5 px-1.5 min-w-5 flex items-center justify-center rounded-full text-[10px]">
                        {stats.cabsCount}
                      </Badge>
                    )}
                    {item.title === "Payments" && stats.paymentsCount > 0 && (
                      <Badge className="ml-auto bg-orange-500 hover:bg-orange-600 text-white border-0 h-5 px-1.5 min-w-5 flex items-center justify-center rounded-full text-[10px]">
                        {stats.paymentsCount}
                      </Badge>
                    )}
                    {item.title === "Upcoming Bookings" && stats.upcomingCount > 0 && (
                      <Badge className="ml-auto bg-violet-500 hover:bg-violet-600 text-white border-0 h-5 px-1.5 min-w-5 flex items-center justify-center rounded-full text-[10px]">
                        {stats.upcomingCount}
                      </Badge>
                    )}
                    {item.title === "Users" && stats.newUsers > 0 && (
                      <Badge className="ml-auto bg-blue-500 hover:bg-blue-600 text-white border-0 h-5 px-1.5 min-w-5 flex items-center justify-center rounded-full text-[10px]">
                        {stats.newUsers}
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
