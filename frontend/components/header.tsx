"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Bell, Settings, Check, HelpCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleProfileClick = () => {
    router.push("/dashboard/profile");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex-1">
        <h2 className="text-lg md:text-2xl font-bold text-foreground">
          Welcome, {user.name?.split(" ")[0]}!
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          {user.speciality}
        </p>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {/* Notifications Dropdown */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground relative"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="font-semibold">
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockNotifications.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {mockNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-secondary transition-colors ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex-shrink-0 ${!notification.read ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {!notification.read && <Check size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                No notifications
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu> */}

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <div className="flex items-center gap-2">Profile Settings</div>
            </DropdownMenuItem>
            <DropdownMenuItem>Account Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <HelpCircle size={16} className="mr-2" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <div className="relative">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              {/* <Image
                src={user.profileImage || ""}
                alt={user.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              /> */}
            </div>
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
