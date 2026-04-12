"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu, Bell, LogOut, CalendarDays, CreditCard, Users, XCircle } from "lucide-react"
import { mockNotifications, type Notification } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

interface AdminHeaderProps {
  onMenuClick: () => void
}

const notificationIcons = {
  booking: CalendarDays,
  payment: CreditCard,
  guide: Users,
  cancellation: XCircle
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter()
  const { logout, user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      // Still redirect even if logout fails
      router.push("/")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-card border-b border-border lg:px-6">
      {/* Menu button - mobile only */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-auto py-1"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type]
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-0",
                        !notification.read && "bg-primary/5"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        notification.type === 'booking' && "bg-chart-1/10 text-chart-1",
                        notification.type === 'payment' && "bg-success/10 text-success",
                        notification.type === 'guide' && "bg-chart-2/10 text-chart-2",
                        notification.type === 'cancellation' && "bg-destructive/10 text-destructive"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(notification.date)}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                  )
                })
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logout */}
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
