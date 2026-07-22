"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllBookings } from "@/lib/api/bookings";
import { getAllCabBookingsApi } from "@/lib/api/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpcomingPopup, setShowUpcomingPopup] = useState(false);
  const [upcomingCount, setUpcomingCount] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push("/");
        return;
      }

      if (user?.role !== "ADMIN") {
        router.push("/");
        return;
      }
    }
  }, [user, loading, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "ADMIN") return;

    const checkUpcomingBookings = async () => {
      try {
        const [bookingsData, cabsData] = await Promise.all([
          getAllBookings({ limit: 100 }),
          getAllCabBookingsApi(),
        ]);

        const extractArray = (res: any): any[] => {
          if (Array.isArray(res)) return res;
          if (Array.isArray(res?.data?.bookings)) return res.data.bookings;
          if (Array.isArray(res?.data)) return res.data;
          if (Array.isArray(res?.bookings)) return res.bookings;
          return [];
        };

        const bookingsList = extractArray(bookingsData);
        const cabsList = extractArray(cabsData);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingBookingsCount = bookingsList.filter((b: any) => {
          if (!b.bookingDate) return false;
          const travelDate = new Date(b.bookingDate);
          travelDate.setHours(0, 0, 0, 0);
          const isFuture = travelDate.getTime() >= today.getTime();
          const isActive = b.status === "CONFIRMED" || b.status === "ACCEPTED";
          return isFuture && isActive;
        }).length;

        const upcomingCabsCount = cabsList.filter((c: any) => {
          if (!c.startDate) return false;
          const travelDate = new Date(c.startDate);
          travelDate.setHours(0, 0, 0, 0);
          const isFuture = travelDate.getTime() >= today.getTime();
          const isActive = c.status === "CONFIRMED";
          return isFuture && isActive;
        }).length;

        const totalUpcoming = upcomingBookingsCount + upcomingCabsCount;

        setUpcomingCount(totalUpcoming);
        if (totalUpcoming > 0) {
          setShowUpcomingPopup(true);
        }
      } catch (err) {
        console.error("Failed to check upcoming bookings:", err);
      }
    };

    checkUpcomingBookings();
  }, [isLoggedIn, user]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not admin
  if (!isLoggedIn || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Admin Upcoming Bookings Global Alert Popup */}
      <Dialog open={showUpcomingPopup} onOpenChange={setShowUpcomingPopup}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Calendar className="text-indigo-600 w-5 h-5" /> Upcoming Bookings
              <Badge className="ml-1 bg-violet-600 hover:bg-violet-700 text-white font-bold px-2 py-0.5 rounded-full text-xs">
                {upcomingCount}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              There are upcoming bookings that require your attention.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => {
                setShowUpcomingPopup(false);
                router.push("/admin/upcoming-bookings");
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 font-semibold"
            >
              View Upcoming Bookings
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowUpcomingPopup(false)}
              className="flex-1 border-slate-200 hover:bg-slate-50 rounded-xl h-10 font-semibold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
