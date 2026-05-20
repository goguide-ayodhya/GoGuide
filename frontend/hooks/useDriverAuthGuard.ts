// hooks/useDriverAuthGuard.ts

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useDriverAuthGuard() {
  const router = useRouter();
  const { user, loading, isLoggedIn } = useAuth();

  useEffect(() => {
    if (loading) {
      return; // Wait for auth to load
    }

    // Allow browsing if not authenticated - don't force redirect
    if (!isLoggedIn || !user) {
      return;
    }

    // Only redirect if authenticated user is a driver with incomplete profile
    if (user.role === "DRIVER") {
      // Check email verification
      if (!user.isEmailVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(user.email || "")}`);
        return;
      }

      // Check profile completion - only redirect if explicitly trying to access driver areas
      if (!user.isProfileComplete) {
        const currentPath = window.location.pathname;
        if (
          currentPath.startsWith("/driver") &&
          !currentPath.startsWith("/driver/complete-profile")
        ) {
          router.push(`/signup/goguide-driver?step=${user.profileStep || 1}`);
          return;
        }
      }
    }
  }, [user, loading, isLoggedIn, router]);

  return { user, loading, isLoggedIn };
}
