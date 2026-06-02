"use client";
import { useDriverAuthGuard } from "@/hooks/useDriverAuthGuard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import { Header } from "@/components/header";
import TouristLoader from "@/components/common/TouristLoader";
import GlobalDriverRideHandler from "@/components/cabs/GlobalDriverRideHandler";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useDriverAuthGuard();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      setTimeout(() => {
        router.push("/login");
      }, 100);
    }
  }, [user, loading]);

  if (loading) {
    return <TouristLoader fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />

      <div className="md:ml-64 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>

      <GlobalDriverRideHandler />
    </div>
  );
}
