"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Car,
  Calendar,
  User,
  Check,
  X,
  Clock,
  MapPin,
  AlertTriangle,
  Heart,
  Eye,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Save,
  Percent,
  Tag,
  IndianRupee,
  CheckCircle,
} from "lucide-react";
import {
  getAllCabBookingsApi,
  updateCabBookingStatusApi,
  getCabLocationsAdminApi,
  createCabLocationApi,
  updateCabLocationApi,
  deleteCabLocationApi,
  getCabCategoriesAdminApi,
  createCabCategoryApi,
  updateCabCategoryApi,
  deleteCabCategoryApi,
  getCabRoutePricesApi,
  createCabRoutePriceApi,
  updateCabRoutePriceApi,
  deleteCabRoutePriceApi,
  getCabTaxApi,
  updateCabTaxApi,
  getCabAdditionalChargesAdminApi,
  updateCabAdditionalChargesApi,
  confirmCabPaymentApi,
} from "@/lib/api/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type CabBookingType = {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  fullName: string;
  phone: string;
  numPeople: number;
  specialAssistance: {
    wheelchair: boolean;
    medicalSupport: boolean;
    elderlyCare: boolean;
    childCare: boolean;
  };
  startDate: string;
  numDays?: number;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
  acPreference?: "AC" | "Non-AC";
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  
  // New fields
  bookingId?: string;
  pickupTime?: string;
  price?: number;
  tax?: number;
  wheelchairCharge?: number;
  medicalSupportCharge?: number;
  totalAmount?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentType?: string;
  isRescheduled?: boolean;

  createdAt: string;
  updatedAt: string;
};

export default function CabBookingsAdminPage() {
  const [activeTab, setActiveTab] = useState<"bookings" | "locations" | "categories" | "pricing" | "tax">("bookings");
  const [bookings, setBookings] = useState<CabBookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<CabBookingType | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Locations states
  const [locations, setLocations] = useState<any[]>([]);
  const [newLocName, setNewLocName] = useState("");
  const [newLocType, setNewLocType] = useState<"pickup" | "dropoff" | "both">("both");
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [editLocName, setEditLocName] = useState("");
  const [editLocType, setEditLocType] = useState<"pickup" | "dropoff" | "both">("both");

  // Categories states
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");

  // Route Pricing states
  const [prices, setPrices] = useState<any[]>([]);
  const [newPricePickup, setNewPricePickup] = useState("");
  const [newPriceDrop, setNewPriceDrop] = useState("");
  const [newPriceCategory, setNewPriceCategory] = useState("");
  const [newPriceBase, setNewPriceBase] = useState("");
  const [newPriceNotes, setNewPriceNotes] = useState("");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceBase, setEditPriceBase] = useState("");
  const [editPriceNotes, setEditPriceNotes] = useState("");

  // Tax and Add-on state
  const [taxPercent, setTaxPercent] = useState<number>(5);
  const [wheelchairCharge, setWheelchairCharge] = useState<number>(0);
  const [medicalSupportCharge, setMedicalSupportCharge] = useState<number>(0);

  const fetchBookings = async () => {
    try {
      const data = await getAllCabBookingsApi();
      setBookings(Array.isArray(data) ? data : data?.bookings || []);
    } catch (err: any) {
      console.error("Failed to fetch bookings:", err);
      setBookings([]);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await getCabLocationsAdminApi();
      setLocations(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCabCategoriesAdminApi();
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchPrices = async () => {
    try {
      const data = await getCabRoutePricesApi();
      setPrices(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
    }
  };

  const fetchTax = async () => {
    try {
      const data = await getCabTaxApi();
      setTaxPercent(typeof data === "number" ? data : data?.data ?? 5);
    } catch (err) {
      console.error("Failed to fetch tax:", err);
    }
  };

  const fetchAdditionalCharges = async () => {
    try {
      const data = await getCabAdditionalChargesAdminApi();
      setWheelchairCharge(data?.wheelchairCharge ?? 0);
      setMedicalSupportCharge(data?.medicalSupportCharge ?? 0);
    } catch (err) {
      console.error("Failed to fetch additional charges:", err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchBookings(),
        fetchLocations(),
        fetchCategories(),
        fetchPrices(),
        fetchTax(),
        fetchAdditionalCharges(),
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to load cab configuration data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleClearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // ──────────────────────────────────────────────
  // CAB BOOKINGS ACTIONS
  // ──────────────────────────────────────────────
  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      handleClearMessages();
      await updateCabBookingStatusApi(bookingId, status);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: status as any } : b))
      );
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: status as any } : null));
      }
      setSuccess(`Booking status updated to ${status.toLowerCase()} successfully.`);
    } catch (err: any) {
      console.error("Failed to update status:", err);
      setError(err.message || "Failed to update status");
    }
  };

  const handleConfirmPayment = async (bookingId: string) => {
    try {
      handleClearMessages();
      await confirmCabPaymentApi(bookingId);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, paymentStatus: "COMPLETED", status: "COMPLETED", isRescheduled: false }
            : b
        )
      );
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking((prev) =>
          prev
            ? { ...prev, paymentStatus: "COMPLETED", status: "COMPLETED", isRescheduled: false }
            : null
        );
      }
      setSuccess("Payment confirmed and booking marked as COMPLETED successfully.");
    } catch (err: any) {
      console.error("Failed to confirm payment:", err);
      setError(err?.message || "Failed to confirm payment");
    }
  };

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter((b) => {
    const start = new Date(b.startDate);
    return b.status === "CONFIRMED" && start >= todayDate;
  }).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200" variant="outline">
            Pending
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200" variant="outline">
            Confirmed
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-rose-100 text-rose-800 border-rose-200" variant="outline">
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const hasSpecialAssistance = (assist: CabBookingType["specialAssistance"]) => {
    return assist.wheelchair || assist.medicalSupport || assist.elderlyCare || assist.childCare;
  };

  const getSpecialAssistanceText = (assist: CabBookingType["specialAssistance"]) => {
    const list = [];
    if (assist.wheelchair) list.push("Wheelchair");
    if (assist.medicalSupport) list.push("Medical Support");
    if (assist.elderlyCare) list.push("Elderly Care");
    if (assist.childCare) list.push("Child Care");
    return list.join(", ");
  };

  const openDetails = (booking: CabBookingType) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  // ──────────────────────────────────────────────
  // LOCATIONS ACTIONS
  // ──────────────────────────────────────────────
  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    handleClearMessages();
    if (!newLocName.trim()) return;

    try {
      await createCabLocationApi({ name: newLocName, type: newLocType });
      setNewLocName("");
      setNewLocType("both");
      setSuccess("Location created successfully.");
      await fetchLocations();
    } catch (err: any) {
      setError(err.message || "Failed to create location.");
    }
  };

  const handleToggleLocationActive = async (loc: any) => {
    handleClearMessages();
    try {
      await updateCabLocationApi(loc._id, { isActive: !loc.isActive });
      setSuccess("Location status updated.");
      await fetchLocations();
      await fetchPrices(); 
    } catch (err: any) {
      setError(err.message || "Failed to toggle location status.");
    }
  };

  const handleStartEditLocation = (loc: any) => {
    setEditingLocId(loc._id);
    setEditLocName(loc.name);
    setEditLocType(loc.type);
  };

  const handleSaveLocationEdit = async () => {
    if (!editingLocId || !editLocName.trim()) return;
    handleClearMessages();

    try {
      await updateCabLocationApi(editingLocId, { name: editLocName, type: editLocType });
      setEditingLocId(null);
      setSuccess("Location updated successfully.");
      await fetchLocations();
    } catch (err: any) {
      setError(err.message || "Failed to update location.");
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location? It will delete related route pricing configs.")) return;
    handleClearMessages();

    try {
      await deleteCabLocationApi(id);
      setSuccess("Location deleted.");
      await fetchLocations();
      await fetchPrices();
    } catch (err: any) {
      setError(err.message || "Failed to delete location.");
    }
  };

  // ──────────────────────────────────────────────
  // CATEGORIES ACTIONS
  // ──────────────────────────────────────────────
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    handleClearMessages();
    if (!newCatName.trim()) return;

    try {
      await createCabCategoryApi({ name: newCatName });
      setNewCatName("");
      setSuccess("Car category created successfully.");
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to create category.");
    }
  };

  const handleToggleCategoryActive = async (cat: any) => {
    handleClearMessages();
    try {
      await updateCabCategoryApi(cat._id, { isActive: !cat.isActive });
      setSuccess("Category status updated.");
      await fetchCategories();
      await fetchPrices();
    } catch (err: any) {
      setError(err.message || "Failed to toggle category status.");
    }
  };

  const handleStartEditCategory = (cat: any) => {
    setEditingCatId(cat._id);
    setEditCatName(cat.name);
  };

  const handleSaveCategoryEdit = async () => {
    if (!editingCatId || !editCatName.trim()) return;
    handleClearMessages();

    try {
      await updateCabCategoryApi(editingCatId, { name: editCatName });
      setEditingCatId(null);
      setSuccess("Category updated successfully.");
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to update category.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    handleClearMessages();

    try {
      await deleteCabCategoryApi(id);
      setSuccess("Category deleted.");
      await fetchCategories();
      await fetchPrices();
    } catch (err: any) {
      setError(err.message || "Failed to delete category.");
    }
  };

  // ──────────────────────────────────────────────
  // ROUTE PRICING ACTIONS
  // ──────────────────────────────────────────────
  const handleCreatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    handleClearMessages();
    if (!newPricePickup || !newPriceDrop || !newPriceCategory || !newPriceBase) {
      setError("Please fill in pickup, drop, car category, and base price.");
      return;
    }

    try {
      await createCabRoutePriceApi({
        pickupLocation: newPricePickup,
        dropLocation: newPriceDrop,
        carCategory: newPriceCategory,
        basePrice: Number(newPriceBase),
        notes: newPriceNotes,
      });

      setNewPriceBase("");
      setNewPriceNotes("");
      setSuccess("Pricing configuration created successfully.");
      await fetchPrices();
    } catch (err: any) {
      setError(err.message || "Failed to create pricing rule. Ensure this combination does not already exist.");
    }
  };

  const handleTogglePriceActive = async (pr: any) => {
    handleClearMessages();
    try {
      await updateCabRoutePriceApi(pr._id, { isActive: !pr.isActive });
      setSuccess("Pricing status updated.");
      await fetchPrices();
    } catch (err: any) {
      setError(err.message || "Failed to update pricing status.");
    }
  };

  const handleStartEditPrice = (pr: any) => {
    setEditingPriceId(pr._id);
    setEditPriceBase(String(pr.basePrice));
    setEditPriceNotes(pr.notes || "");
  };

  const handleSavePriceEdit = async () => {
    if (!editingPriceId || !editPriceBase.trim()) return;
    handleClearMessages();

    try {
      await updateCabRoutePriceApi(editingPriceId, {
        basePrice: Number(editPriceBase),
        notes: editPriceNotes,
      });
      setEditingPriceId(null);
      setSuccess("Pricing configuration updated.");
      await fetchPrices();
    } catch (err: any) {
      setError(err.message || "Failed to update pricing configuration.");
    }
  };

  const handleDeletePrice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing configuration?")) return;
    handleClearMessages();

    try {
      await deleteCabRoutePriceApi(id);
      setSuccess("Pricing configuration deleted.");
      await fetchPrices();
    } catch (err: any) {
      setError(err.message || "Failed to delete pricing configuration.");
    }
  };

  // ──────────────────────────────────────────────
  // TAX & ADDON ACTIONS
  // ──────────────────────────────────────────────
  const handleSaveTaxAndAddons = async () => {
    handleClearMessages();
    if (taxPercent < 0 || taxPercent > 100) {
      setError("Tax percentage must be between 0 and 100.");
      return;
    }
    if (wheelchairCharge < 0 || medicalSupportCharge < 0) {
      setError("Additional charges must be 0 or positive numbers.");
      return;
    }

    try {
      await Promise.all([
        updateCabTaxApi(taxPercent),
        updateCabAdditionalChargesApi(wheelchairCharge, medicalSupportCharge),
      ]);
      setSuccess("Tax percentage and additional add-on charges updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update settings.");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Cab Bookings & Settings
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Review request lists, configure routes, set pricing matrices, and configure additional add-ons.
          </p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 shrink-0 self-start xl:self-center overflow-x-auto max-w-full">
          <Button
            size="sm"
            variant={activeTab === "bookings" ? "default" : "ghost"}
            onClick={() => setActiveTab("bookings")}
            className="rounded-xl px-4 h-9 font-medium"
          >
            Request Bookings
          </Button>
          <Button
            size="sm"
            variant={activeTab === "locations" ? "default" : "ghost"}
            onClick={() => setActiveTab("locations")}
            className="rounded-xl px-4 h-9 font-medium"
          >
            Locations
          </Button>
          <Button
            size="sm"
            variant={activeTab === "categories" ? "default" : "ghost"}
            onClick={() => setActiveTab("categories")}
            className="rounded-xl px-4 h-9 font-medium"
          >
            Car Categories
          </Button>
          <Button
            size="sm"
            variant={activeTab === "pricing" ? "default" : "ghost"}
            onClick={() => setActiveTab("pricing")}
            className="rounded-xl px-4 h-9 font-medium"
          >
            Route Pricing
          </Button>
          <Button
            size="sm"
            variant={activeTab === "tax" ? "default" : "ghost"}
            onClick={() => setActiveTab("tax")}
            className="rounded-xl px-4 h-9 font-medium"
          >
            Tax & Add-ons
          </Button>
        </div>
      </div>

      {/* Messages banner */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={handleClearMessages} className="text-destructive hover:opacity-85">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex justify-between items-center">
          <span>{success}</span>
          <button onClick={handleClearMessages} className="text-emerald-700 hover:opacity-85">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading Block */}
      {loading && (
        <div className="p-12 text-center bg-white border border-border rounded-3xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Synchronizing data configuration...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* REQUEST BOOKINGS LIST TAB */}
          {activeTab === "bookings" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">Submitted in total</p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Action
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">{pendingBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Confirmed & Upcoming
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-600">{upcomingBookings}</div>
                    <p className="text-xs text-muted-foreground mt-1">Active scheduled bookings</p>
                  </CardContent>
                </Card>
              </div>

              {/* Bookings Card Container */}
              <Card className="border-border">
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                  <div>
                    <CardTitle className="text-base">Tourist Booking List</CardTitle>
                    <CardDescription>Review list of custom cab requests</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadAllData} className="h-8 text-xs font-semibold">
                    Sync List
                  </Button>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                  {bookings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      No cab booking requests found in database.
                    </div>
                  ) : (
                    <>
                      {/* Desktop list view */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                               <th className="py-3 px-2">Tourist Name</th>
                              <th className="py-3 px-2">Mobile</th>
                              <th className="py-3 px-2">Travel Date</th>
                              <th className="py-3 px-2 text-center">Payment Method</th>
                              <th className="py-3 px-2">Vehicle</th>
                              <th className="py-3 px-2">Locations (Pickup → Drop)</th>
                              <th className="py-3 px-2">Assistance</th>
                              <th className="py-3 px-2 text-center">Status</th>
                              <th className="py-3 px-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {bookings.map((booking) => (
                              <tr key={booking._id} className="hover:bg-slate-50/50 transition">
                                <td className="py-3.5 px-2 font-medium text-foreground">
                                  {booking.fullName}
                                </td>
                                <td className="py-3.5 px-2 text-muted-foreground">
                                  {booking.phone}
                                </td>
                                <td className="py-3.5 px-2">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                    {new Date(booking.startDate).toLocaleDateString()}
                                  </span>
                                </td>
                                <td className="py-3.5 px-2 text-center">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="font-semibold text-xs text-slate-800">
                                      {booking.paymentMethod || booking.paymentType || "Pending"}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] ${
                                        booking.paymentStatus === "COMPLETED"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-amber-50 text-amber-700 border-amber-200"
                                      }`}
                                    >
                                      {booking.paymentStatus || "PENDING"}
                                    </Badge>
                                  </div>
                                </td>
                                <td className="py-3.5 px-2 font-semibold">
                                  {booking.vehicleType}
                                </td>
                                <td className="py-3.5 px-2 max-w-[200px] truncate">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    <span className="truncate">{booking.pickupLocation} → {booking.dropoffLocation}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-2">
                                  {hasSpecialAssistance(booking.specialAssistance) ? (
                                    <Badge
                                      className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]"
                                      variant="outline"
                                    >
                                      Yes: {getSpecialAssistanceText(booking.specialAssistance)}
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">None</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-2 text-center">
                                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1">
                                    {getStatusBadge(booking.status)}
                                    {booking.isRescheduled && (
                                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px]" variant="outline">
                                        Rescheduled
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3.5 px-2 text-right">
                                  <div className="flex justify-end items-center gap-1.5">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openDetails(booking)}
                                      className="h-8 w-8 text-indigo-600"
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    {booking.paymentStatus !== "COMPLETED" && booking.status !== "CANCELLED" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleConfirmPayment(booking._id)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs px-2.5 h-7"
                                        title="Confirm Payment & Complete"
                                      >
                                        Confirm Payment
                                      </Button>
                                    )}
                                    {booking.status === "PENDING" && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleUpdateStatus(booking._id, "CONFIRMED")}
                                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                          title="Confirm Request"
                                        >
                                          <Check className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleUpdateStatus(booking._id, "CANCELLED")}
                                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                          title="Reject Request"
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </>
                                    )}
                                    {booking.status === "CONFIRMED" && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleUpdateStatus(booking._id, "COMPLETED")}
                                        className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                        title="Mark as Completed"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile list view cards */}
                      <div className="grid grid-cols-1 gap-4 md:hidden p-4">
                        {bookings.map((booking) => (
                          <div key={booking._id} className="p-4 border rounded-2xl bg-white space-y-3 shadow-sm hover:shadow">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-foreground">{booking.fullName}</span>
                              <div className="flex items-center gap-1.5">
                                {getStatusBadge(booking.status)}
                                {booking.isRescheduled && (
                                  <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px]" variant="outline">
                                    Rescheduled
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-xs space-y-1.5 text-muted-foreground">
                              <div className="flex justify-between">
                                <span>Phone:</span>
                                <span className="text-foreground">{booking.phone}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Date:</span>
                                <span className="text-foreground">
                                  {new Date(booking.startDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Payment:</span>
                                <span className="font-semibold text-emerald-700">
                                  {booking.paymentMethod || booking.paymentType || "Pending"} ({booking.paymentStatus || "PENDING"})
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Route:</span>
                                <span className="font-medium text-foreground text-right truncate max-w-[200px]">
                                  {booking.pickupLocation} → {booking.dropoffLocation}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Vehicle:</span>
                                <span className="font-medium text-foreground">
                                  {booking.vehicleType}
                                </span>
                              </div>
                              {hasSpecialAssistance(booking.specialAssistance) && (
                                <div className="flex justify-between mt-1 text-rose-600 font-medium">
                                  <span>Assistance:</span>
                                  <span>{getSpecialAssistanceText(booking.specialAssistance)}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-border justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDetails(booking)}
                                className="h-8 text-xs"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                              </Button>
                              {booking.status === "PENDING" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateStatus(booking._id, "CONFIRMED")}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateStatus(booking._id, "CANCELLED")}
                                    className="border-rose-200 text-rose-600 hover:bg-rose-50 h-8 text-xs"
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              {booking.status === "CONFIRMED" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateStatus(booking._id, "COMPLETED")}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs font-semibold"
                                >
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* LOCATIONS TAB */}
          {activeTab === "locations" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Location Form */}
              <Card className="lg:col-span-1 border-border h-fit">
                <CardHeader>
                  <CardTitle className="text-base">Add New Location</CardTitle>
                  <CardDescription>Configure pickup or drop hotspots</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateLocation} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="loc-name">Location Name *</Label>
                      <Input
                        id="loc-name"
                        placeholder="e.g. Ayodhya Airport"
                        value={newLocName}
                        onChange={(e) => setNewLocName(e.target.value)}
                        required
                        className="rounded-xl border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location Type *</Label>
                      <Select
                        value={newLocType}
                        onValueChange={(val: any) => setNewLocType(val)}
                      >
                        <SelectTrigger className="rounded-xl border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup">Pickup Only</SelectItem>
                          <SelectItem value="dropoff">Dropoff Only</SelectItem>
                          <SelectItem value="both">Both (Pickup & Dropoff)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-1">
                      <Plus className="w-4 h-4" /> Add Location
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Locations List */}
              <Card className="lg:col-span-2 border-border">
                <CardHeader>
                  <CardTitle className="text-base">Active / Inactive Locations</CardTitle>
                  <CardDescription>Manage status and types</CardDescription>
                </CardHeader>
                <CardContent>
                  {locations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No locations created yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                            <th className="py-3">Name</th>
                            <th className="py-3">Allowed For</th>
                            <th className="py-3 text-center">Status</th>
                            <th className="py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {locations.map((loc) => (
                            <tr key={loc._id}>
                              <td className="py-3.5">
                                {editingLocId === loc._id ? (
                                  <Input
                                    value={editLocName}
                                    onChange={(e) => setEditLocName(e.target.value)}
                                    className="rounded-lg h-8 w-48 text-xs border-border"
                                  />
                                ) : (
                                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> {loc.name}
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5">
                                {editingLocId === loc._id ? (
                                  <Select
                                    value={editLocType}
                                    onValueChange={(val: any) => setEditLocType(val)}
                                  >
                                    <SelectTrigger className="rounded-lg h-8 text-xs border-border">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pickup">Pickup Only</SelectItem>
                                      <SelectItem value="dropoff">Dropoff Only</SelectItem>
                                      <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {loc.type === "both" ? "Pickup & Drop" : loc.type}
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3.5 text-center">
                                <button
                                  onClick={() => handleToggleLocationActive(loc)}
                                  title="Toggle status"
                                >
                                  {loc.isActive ? (
                                    <span className="text-emerald-600 flex items-center justify-center gap-0.5">
                                      <ToggleRight className="w-5 h-5" /> Active
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 flex items-center justify-center gap-0.5">
                                      <ToggleLeft className="w-5 h-5" /> Inactive
                                    </span>
                                  )}
                                </button>
                              </td>
                              <td className="py-3.5 text-right">
                                {editingLocId === loc._id ? (
                                  <div className="flex gap-1.5 justify-end">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={handleSaveLocationEdit}
                                      className="h-7 w-7 text-emerald-600"
                                      title="Save"
                                    >
                                      <Save className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => setEditingLocId(null)}
                                      className="h-7 w-7 text-slate-500"
                                      title="Cancel"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex gap-1 justify-end">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleStartEditLocation(loc)}
                                      className="h-7 w-7 text-indigo-500"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleDeleteLocation(loc._id)}
                                      className="h-7 w-7 text-rose-500"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* CAR CATEGORIES TAB */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Category Form */}
              <Card className="lg:col-span-1 border-border h-fit">
                <CardHeader>
                  <CardTitle className="text-base">Add Car Category</CardTitle>
                  <CardDescription>Configure vehicle category options</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Category Name *</Label>
                      <Input
                        id="cat-name"
                        placeholder="e.g. Sedan or SUV"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        required
                        className="rounded-xl border-border"
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-1">
                      <Plus className="w-4 h-4" /> Add Category
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Categories List */}
              <Card className="lg:col-span-2 border-border">
                <CardHeader>
                  <CardTitle className="text-base">Car Categories</CardTitle>
                  <CardDescription>Configure active car types</CardDescription>
                </CardHeader>
                <CardContent>
                  {categories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No car categories created yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                            <th className="py-3">Name</th>
                            <th className="py-3 text-center">Status</th>
                            <th className="py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {categories.map((cat) => (
                            <tr key={cat._id}>
                              <td className="py-3.5 font-semibold text-slate-800">
                                {editingCatId === cat._id ? (
                                  <Input
                                    value={editCatName}
                                    onChange={(e) => setEditCatName(e.target.value)}
                                    className="rounded-lg h-8 w-48 text-xs border-border"
                                  />
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Tag className="w-3.5 h-3.5 text-indigo-500" /> {cat.name}
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 text-center">
                                <button
                                  onClick={() => handleToggleCategoryActive(cat)}
                                  title="Toggle status"
                                >
                                  {cat.isActive ? (
                                    <span className="text-emerald-600 flex items-center justify-center gap-0.5">
                                      <ToggleRight className="w-5 h-5" /> Active
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 flex items-center justify-center gap-0.5">
                                      <ToggleLeft className="w-5 h-5" /> Inactive
                                    </span>
                                  )}
                                </button>
                              </td>
                              <td className="py-3.5 text-right">
                                {editingCatId === cat._id ? (
                                  <div className="flex gap-1.5 justify-end">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={handleSaveCategoryEdit}
                                      className="h-7 w-7 text-emerald-600"
                                      title="Save"
                                    >
                                      <Save className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => setEditingCatId(null)}
                                      className="h-7 w-7 text-slate-500"
                                      title="Cancel"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex gap-1 justify-end">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleStartEditCategory(cat)}
                                      className="h-7 w-7 text-indigo-500"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleDeleteCategory(cat._id)}
                                      className="h-7 w-7 text-rose-500"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ROUTE PRICING TAB */}
          {activeTab === "pricing" && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Add Route Pricing Form */}
              <Card className="xl:col-span-1 border-border h-fit">
                <CardHeader>
                  <CardTitle className="text-base">Configure Route Price</CardTitle>
                  <CardDescription>Setup route + category base price</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreatePrice} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pickup Location *</Label>
                      <Select
                        value={newPricePickup}
                        onValueChange={setNewPricePickup}
                      >
                        <SelectTrigger className="rounded-xl border-border">
                          <SelectValue placeholder="Select Pickup" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations
                            .filter((l) => l.isActive && (l.type === "pickup" || l.type === "both"))
                            .map((l) => (
                              <SelectItem key={l._id} value={l._id}>
                                {l.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Drop Location *</Label>
                      <Select
                        value={newPriceDrop}
                        onValueChange={setNewPriceDrop}
                      >
                        <SelectTrigger className="rounded-xl border-border">
                          <SelectValue placeholder="Select Drop" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations
                            .filter((l) => l.isActive && (l.type === "dropoff" || l.type === "both"))
                            .map((l) => (
                              <SelectItem key={l._id} value={l._id}>
                                {l.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Car Category *</Label>
                      <Select
                        value={newPriceCategory}
                        onValueChange={setNewPriceCategory}
                      >
                        <SelectTrigger className="rounded-xl border-border">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter((c) => c.isActive)
                            .map((c) => (
                              <SelectItem key={c._id} value={c._id}>
                                {c.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price-base">Base Price (INR) *</Label>
                      <div className="relative">
                        <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <Input
                          id="price-base"
                          type="number"
                          placeholder="e.g. 1000"
                          value={newPriceBase}
                          onChange={(e) => setNewPriceBase(e.target.value)}
                          required
                          className="rounded-xl pl-9 border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price-notes">Additional Notes</Label>
                      <textarea
                        id="price-notes"
                        placeholder="e.g. Includes toll tax, parking charges extra"
                        value={newPriceNotes}
                        onChange={(e) => setNewPriceNotes(e.target.value)}
                        className="flex min-h-[70px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border-border"
                      />
                    </div>

                    <Button type="submit" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-1">
                      <Plus className="w-4 h-4" /> Save Route Price
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Route Pricing Configurations List */}
              <Card className="xl:col-span-3 border-border">
                <CardHeader>
                  <CardTitle className="text-base">Route Fare Matrices</CardTitle>
                  <CardDescription>Setup prices for each active route combination</CardDescription>
                </CardHeader>
                <CardContent>
                  {prices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No route prices configured yet. Add routes in the configuration panel on the left.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                            <th className="py-3">Route (Pickup → Drop)</th>
                            <th className="py-3">Car Category</th>
                            <th className="py-3">Price</th>
                            <th className="py-3">Notes</th>
                            <th className="py-3 text-center">Status</th>
                            <th className="py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {prices.map((pr) => {
                            const isEditing = editingPriceId === pr._id;
                            const pickupName = pr.pickupLocation?.name || "Deleted Location";
                            const dropName = pr.dropLocation?.name || "Deleted Location";
                            const categoryName = pr.carCategory?.name || "Deleted Category";
                            const isRouteActive = pr.pickupLocation?.isActive && pr.dropLocation?.isActive && pr.carCategory?.isActive;

                            return (
                              <tr key={pr._id} className={!isRouteActive ? "opacity-60 bg-slate-50/50" : ""}>
                                <td className="py-3.5">
                                  <span className="font-semibold text-slate-800 block">
                                    {pickupName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    → {dropName}
                                  </span>
                                  {!isRouteActive && (
                                    <span className="text-[10px] block text-rose-500 font-medium mt-0.5">
                                      * Inactive route dependencies detected
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5">
                                  <Badge variant="outline">{categoryName}</Badge>
                                </td>
                                <td className="py-3.5 font-bold text-indigo-950">
                                  {isEditing ? (
                                    <Input
                                      value={editPriceBase}
                                      onChange={(e) => setEditPriceBase(e.target.value)}
                                      className="rounded-lg h-8 w-24 text-xs border-border"
                                      type="number"
                                    />
                                  ) : (
                                    `₹${pr.basePrice}`
                                  )}
                                </td>
                                <td className="py-3.5 text-xs text-muted-foreground max-w-[150px] truncate">
                                  {isEditing ? (
                                    <Input
                                      value={editPriceNotes}
                                      onChange={(e) => setEditPriceNotes(e.target.value)}
                                      className="rounded-lg h-8 w-32 text-xs border-border"
                                    />
                                  ) : (
                                    pr.notes || "None"
                                  )}
                                </td>
                                <td className="py-3.5 text-center">
                                  <button
                                    onClick={() => handleTogglePriceActive(pr)}
                                    title="Toggle status"
                                    disabled={!isRouteActive && pr.isActive}
                                  >
                                    {pr.isActive ? (
                                      <span className="text-emerald-600 flex items-center justify-center gap-0.5 text-xs">
                                        <ToggleRight className="w-5 h-5" /> Active
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 flex items-center justify-center gap-0.5 text-xs">
                                        <ToggleLeft className="w-5 h-5" /> Inactive
                                      </span>
                                    )}
                                  </button>
                                </td>
                                <td className="py-3.5 text-right">
                                  {isEditing ? (
                                    <div className="flex gap-1.5 justify-end">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={handleSavePriceEdit}
                                        className="h-7 w-7 text-emerald-600"
                                        title="Save"
                                      >
                                        <Save className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setEditingPriceId(null)}
                                        className="h-7 w-7 text-slate-500"
                                        title="Cancel"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-1 justify-end">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleStartEditPrice(pr)}
                                        className="h-7 w-7 text-indigo-500"
                                        title="Edit Price"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDeletePrice(pr._id)}
                                        className="h-7 w-7 text-rose-500"
                                        title="Delete Pricing"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAX & ADD-ONS SETTINGS TAB */}
          {activeTab === "tax" && (
            <Card className="max-w-md border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Percent className="w-5 h-5 text-indigo-500" /> Tax & Add-on Charges
                </CardTitle>
                <CardDescription>Configure global tax rate and special assistance charges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-percent">Cab Booking GST/Tax Rate (%)</Label>
                  <div className="relative">
                    <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                    <Input
                      id="tax-percent"
                      type="number"
                      min="0"
                      max="100"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Number(e.target.value))}
                      className="rounded-xl border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wheelchair-charge">Wheelchair Additional Charge (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <Input
                      id="wheelchair-charge"
                      type="number"
                      min="0"
                      value={wheelchairCharge}
                      onChange={(e) => setWheelchairCharge(Number(e.target.value))}
                      className="rounded-xl pl-9 border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medical-support-charge">Medical Support Additional Charge (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <Input
                      id="medical-support-charge"
                      type="number"
                      min="0"
                      value={medicalSupportCharge}
                      onChange={(e) => setMedicalSupportCharge(Number(e.target.value))}
                      className="rounded-xl pl-9 border-border"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveTaxAndAddons}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Save Tax & Add-ons Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>Cab Booking Details</DialogTitle>
            <DialogDescription>
              Full information for this booking request.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between border-b pb-1.5 text-xs text-muted-foreground">
                <span>Created Date:</span>
                <span>
                  {selectedBooking.createdAt
                    ? new Date(selectedBooking.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Booking ID</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedBooking.bookingId || selectedBooking._id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tourist Name</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedBooking.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mobile Number</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedBooking.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Travel Start Date</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {new Date(selectedBooking.startDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pickup Time</p>
                  <p className="font-semibold text-indigo-600 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> {selectedBooking.pickupTime || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="font-semibold text-emerald-600 mt-0.5">
                    {selectedBooking.paymentMethod || selectedBooking.paymentType || "Cash / Online"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Number of People</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedBooking.numPeople}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vehicle Requested</p>
                  <p className="font-semibold text-orange-600 mt-0.5">{selectedBooking.vehicleType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Booking Status</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    {getStatusBadge(selectedBooking.status)}
                    {selectedBooking.isRescheduled && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px]" variant="outline">
                        Rescheduled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground">Pickup Location</p>
                  <p className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> {selectedBooking.pickupLocation}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground">Dropoff Location</p>
                  <p className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> {selectedBooking.dropoffLocation}
                  </p>
                </div>
              </div>

              {/* Pricing breakdown block for admin */}
              <div className="border-t border-border pt-3 bg-slate-50 p-3 rounded-xl border space-y-1.5 text-xs">
                <p className="font-bold text-slate-900 uppercase">Fare Details</p>
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Price:</span>
                  <span className="font-semibold text-slate-900">₹{selectedBooking.price || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">GST / Tax:</span>
                  <span className="font-semibold text-slate-900">₹{selectedBooking.tax || 0}</span>
                </div>
                {(selectedBooking.wheelchairCharge ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Wheelchair Assistance Fee:</span>
                    <span className="font-semibold text-slate-900">₹{selectedBooking.wheelchairCharge}</span>
                  </div>
                )}
                {(selectedBooking.medicalSupportCharge ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Medical Support Fee:</span>
                    <span className="font-semibold text-slate-900">₹{selectedBooking.medicalSupportCharge}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1 font-bold text-sm text-indigo-900">
                  <span>Total price:</span>
                  <span>₹{selectedBooking.totalAmount || selectedBooking.price || 0}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t text-muted-foreground mt-1">
                  <span>Payment Status:</span>
                  <span className="font-bold uppercase text-slate-800">{selectedBooking.paymentStatus || "PENDING"}</span>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-1.5">Special Assistance Required</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        selectedBooking.specialAssistance.wheelchair
                          ? "bg-rose-500 border-rose-600 text-white"
                          : "border-border"
                      }`}
                    >
                      {selectedBooking.specialAssistance.wheelchair && "✓"}
                    </div>
                    <span>Wheelchair</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        selectedBooking.specialAssistance.medicalSupport
                          ? "bg-rose-500 border-rose-600 text-white"
                          : "border-border"
                      }`}
                    >
                      {selectedBooking.specialAssistance.medicalSupport && "✓"}
                    </div>
                    <span>Medical Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        selectedBooking.specialAssistance.elderlyCare
                          ? "bg-rose-500 border-rose-600 text-white"
                          : "border-border"
                      }`}
                    >
                      {selectedBooking.specialAssistance.elderlyCare && "✓"}
                    </div>
                    <span>Elderly Care</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        selectedBooking.specialAssistance.childCare
                          ? "bg-rose-500 border-rose-600 text-white"
                          : "border-border"
                      }`}
                    >
                      {selectedBooking.specialAssistance.childCare && "✓"}
                    </div>
                    <span>Child Care</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border pt-3 flex flex-row gap-2 justify-between items-center w-full">
            {selectedBooking && selectedBooking.paymentStatus !== "COMPLETED" && selectedBooking.status !== "CANCELLED" && (
              <Button
                onClick={() => {
                  handleConfirmPayment(selectedBooking._id);
                  setDetailsOpen(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs px-4"
              >
                Confirm Payment & Complete
              </Button>
            )}
            {selectedBooking && selectedBooking.status === "CONFIRMED" && selectedBooking.paymentStatus === "COMPLETED" && (
              <Button
                onClick={() => {
                  handleUpdateStatus(selectedBooking._id, "COMPLETED");
                  setDetailsOpen(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs px-4"
              >
                Mark as Completed
              </Button>
            )}
            <Button variant="outline" onClick={() => setDetailsOpen(false)} className="rounded-xl border-slate-200 ml-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
