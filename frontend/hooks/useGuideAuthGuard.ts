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

    if (!isLoggedIn || !user) {
      router.push("/login");
      return;
    }

    if (user.role !== "GUIDE") {
      router.push("/");
      return;
    }

    // Check email verification
    if (!user.isEmailVerified) {
      router.push(`/verify-email?email=${encodeURIComponent(user.email || "")}`);
      return;
    }

    // Check profile completion
    if (!user.isProfileComplete) {
      router.push("/guide/complete-profile");
      return;
    }
  }, [user, loading, isLoggedIn, router]);

  return { user, loading, isLoggedIn };
}
