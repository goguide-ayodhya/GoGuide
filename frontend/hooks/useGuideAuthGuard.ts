// hooks/useGuideAuthGuard.ts

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useGuideAuthGuard() {
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

    // Only redirect if authenticated user is a guide with incomplete profile
    if (user.role === "GUIDE") {
      // Check email verification
      if (!user.isEmailVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(user.email || "")}`);
        return;
      }

      // Check profile completion - only redirect if explicitly trying to access guide areas
      if (!user.isProfileComplete) {
        const currentPath = window.location.pathname;
        if (currentPath.startsWith("/guide")) {
          router.push("/signup/goguide-guide");
          return;
        }
      }
    }
  }, [user, loading, isLoggedIn, router]);

  return { user, loading, isLoggedIn };
}
