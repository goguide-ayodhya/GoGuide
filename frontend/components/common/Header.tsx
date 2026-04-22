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
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-sm shadow-sm border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 flex items-center justify-between">
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
            <Link href="/" className="flex items-center gap-3">
              <Image src={assets.logo} alt="GoGuide" width={40} height={40} />
              <span className="hidden md:block font-semibold text-slate-900 text-lg tracking-tight">
                GoGuide
              </span>
            </Link>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Desktop My Bookings */}
          <Link href="/tourist/bookings" className="hidden md:inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition">
            My Bookings
          </Link>

          {/* Contact */}
          <Link href="/contact-us" className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-sky-50 to-indigo-50 text-indigo-600 text-sm hover:from-sky-100 hover:to-indigo-100 transition">
            <Phone size={16} />
            <span>Contact</span>
          </Link>

          {/* Profile / Login */}
          {user ? (
            <Link href="/tourist/profile" className="inline-flex items-center justify-center h-10 w-10 rounded-full overflow-hidden ring-1 ring-slate-100 shadow-sm">
              {user?.avatar || user?.profileImage ? (
                <Image src={(user.avatar || user.profileImage) as string} alt={user.name} width={40} height={40} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</div>
              )}
            </Link>
          ) : (
            <Link href="/login" className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 hover:shadow-sm">
              <User size={18} />
            </Link>
          )}

          {/* Mobile Menu */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg border border-slate-100 shadow-sm">
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {isOpen && (
        <div className="md:hidden absolute top-full right-4 z-50 bg-white rounded-xl shadow-lg px-4 py-4 w-56">
          <Link href="/tourist/bookings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-sm font-medium px-2 py-2 rounded hover:bg-slate-50">
            <BookOpen size={16} />
            My Bookings
          </Link>

          {user ? (
            <button onClick={handleLogout} className="w-full text-left mt-2 px-2 py-2 rounded text-sm text-rose-600 hover:bg-slate-50 flex items-center gap-2">
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link href="/login" onClick={() => setIsOpen(false)} className="w-full block mt-2 px-2 py-2 rounded text-sm hover:bg-slate-50">Login</Link>
          )}
        </div>
      )}
    </header>
  );
}
