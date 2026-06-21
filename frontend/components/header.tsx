"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useDriver } from "@/contexts/DriverContext";
import { Bell, Contact, LogOut, Menu, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { assets } from "@/public/assets/assets";
import { useEffect, useState } from "react";
import { getNotificationUnreadCountApi } from "@/lib/api/guide-extras";
import { MessageCenterModal } from "@/components/MessageCenterModal";

export function Header() {
  const { user, logout } = useAuth();
  const { myDriver } = useDriver();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "GUIDE") return;
    // Fetch unread count on mount
    getNotificationUnreadCountApi()
      .then((data: any) => setUnreadCount(data?.count ?? 0))
      .catch(() => {});
  }, [user]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
        <div className="flex-1">
          <Image
            src={assets.logo}
            alt="GoGuide Ayodhya Logo"
            className="h-8 w-auto"
            width={32}
            height={32}
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Message Bell — guides only */}
          {user.role === "GUIDE" && (
            <button
              onClick={() => setShowMessages(true)}
              className="relative p-2 hover:bg-primary/20 cursor-pointer rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Message Center"
            >
              <MessageSquare size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          )}

          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <div
              className="relative cursor-pointer"
              onClick={() => router.push("/driver/dashboard/profile")}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                {(() => {
                  if (user.role === "DRIVER") {
                    return myDriver?.driverPhoto || user.avatar || user.profileImage ? (
                      <Image
                        src={myDriver?.driverPhoto || user.avatar || user.profileImage || assets.guideImage}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {user.name?.charAt(0) ?? "?"}
                      </div>
                    );
                  }
                  return user.avatar || user.profileImage ? (
                    <Image
                      src={myDriver?.driverPhoto || user.avatar || user.profileImage || assets.guideImage}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {user.name?.charAt(0) ?? "?"}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 hover:bg-primary/20 cursor-pointer rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Settings"
              >
                <Menu size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/contact-us")}>
                <Contact size={16} className="mr-2" />
                Contact Us
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut size={16} className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Message Center Modal */}
      {showMessages && (
        <MessageCenterModal
          onClose={() => setShowMessages(false)}
          onRead={() => setUnreadCount(0)}
        />
      )}
    </>
  );
}
