"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showBack?: boolean;
  hideHome?: boolean;
}

export function Header({
  title,
  showBackButton = false,
  showBack = false,
  hideHome = false,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-muted border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-3">
          {(showBackButton || showBack) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex flex-col">
            {!hideHome && (
              <Link
                href="/"
                className="font-semibold text-sm md:text-lg text-primary hover:text-accent transition-colors"
              >
                Ayodhya
              </Link>
            )}
            {title && (
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {title}
              </h1>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hideHome && showBackButton && (
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
          )}
          <Link
            href="/tourist/bookings"
            className="text-sm font-semibold text-primary hover:text-accent transition-colors"
          >
            My Bookings
          </Link>

          <Link
            href="/login"
            className="text-sm p-2 px-4 rounded-b-md text-black font-semibold hover:bg-black-10 transition-colors duration-200"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
