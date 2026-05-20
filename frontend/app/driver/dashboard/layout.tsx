"use client";
import { useDriverAuthGuard } from "@/hooks/useDriverAuthGuard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import { Header } from "@/components/header";
import TouristLoader from "@/components/common/TouristLoader";
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
      {/* Sidebar - Single responsive component */}
      <SidebarNav />
      {/* Main Content Area - Positioned to account for fixed sidebar */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <Header />
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
