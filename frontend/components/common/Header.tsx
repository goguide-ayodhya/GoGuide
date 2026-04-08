"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, User, Phone, Menu, LogOut, BookOpen } from "lucide-react";
import { assets } from "@/public/assets/assets";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  showBackButton?: boolean;
  showBack?: boolean;
  hideHome?: boolean;
}

export function Header({
  showBackButton = false,
  showBack = false,
  hideHome = false,
}: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    logout();
    setIsOpen(false);
    router.push("/login");
  };

  if (!isMounted) return null;

  return (
    <header className="relative sticky top-0 z-50 bg-background/100 border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {(showBackButton || showBack) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9 rounded-full hover:bg-primary cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          {!hideHome && (
            <Link href="/" className="flex items-center gap-2">
              <Image src={assets.logo} alt="GoGuide" width={36} height={36} />
              <span className="hidden md:block font-bold text-primary text-lg">
                GoGuide
              </span>
            </Link>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Desktop My Bookings */}
          <Link
            href="/tourist/bookings"
            className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition"
          >
            My Bookings
          </Link>

          {/* Contact */}
          <Link
            href="/contact-us"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition"
          >
            <Phone size={16} />
            <span className="hidden md:inline">Contact</span>
          </Link>

          {/* Profile / Login */}
          {user ? (
            <Link
              href="/tourist/profile"
              className="h-9 w-9 rounded-full overflow-hidden border border-border"
            >
              <div className="h-9 w-9 rounded-full overflow-hidden border border-border bg-primary flex items-center justify-center">
                {user?.avatar || user?.profileImage ? (
                  <Image
                    src={(user.avatar || user.profileImage) as string}
                    alt={user.name}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center h-9 w-9 rounded-full border border-border hover:bg-muted"
            >
              <User size={18} />
            </Link>
          )}

          {/* Mobile Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {isOpen && (
        <div className="md:hidden absolute top-full right-0 rounded-b-lg z-50 bg-background border-t border-border shadow-lg px-4 py-3 space-y-3">
          <Link
            href="/tourist/bookings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <BookOpen size={16} />
            My Bookings
          </Link>

          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-500"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}
