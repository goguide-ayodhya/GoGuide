"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: CalendarDays
  },
  {
    title: "Guides",
    href: "/admin/guides",
    icon: Users
  },
  {
    title: "Cabs",
    href: "/admin/cabs",
    icon: Car
  },
  {
    title: "Passes",
    href: "/admin/passes",
    icon: Ticket
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard
  },
  {
    title: "Revenue",
    href: "/admin/revenue",
    icon: TrendingUp
  },
  {
    title: "Messages",
    href: "/admin/messages",
    icon: MessageSquare
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: Star
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings
  }
]

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

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
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">GoGuide</span>
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
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5",
                      isActive ? "text-sidebar-primary" : "text-muted-foreground"
                    )} />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">admin@goguide.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
