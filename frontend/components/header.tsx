"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Bell, Settings, Check, HelpCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { assets } from "@/public/assets/assets";

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
        <Image
          src={assets.logo}
          alt="GoGuide Ayodhya Logo"
          className="h-8 w-auto"
          width={32}
          height={32}
        />
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          {user.speciality}
        </p>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 hover:bg-primary/20 cursor-pointer rounded-lg border- transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleProfileClick}>
              <div className="flex items-center gap-2">Profile Settings</div>
            </DropdownMenuItem>
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
              {user.avatar || user.profileImage ? (
                <Image
                  src={user.avatar || user.profileImage || ""}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
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
