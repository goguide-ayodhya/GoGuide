"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import { Header } from "@/components/header";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      setTimeout(() => {
        router.push("/login");
      }, 100);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        {" "}
        <div className="text-center">
          {" "}
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>{" "}
          <p className="text-muted-foreground">Loading...</p>{" "}
        </div>{" "}
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
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
