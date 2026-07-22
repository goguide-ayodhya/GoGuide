"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CabsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/cab-bookings");
  }, [router]);

  return (
    <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
      Redirecting to Cab Bookings page...
    </div>
  );
}
