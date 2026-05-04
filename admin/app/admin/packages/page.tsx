"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { getPackages, deletePackage } from "@/lib/api/tourPackages";
import PackageForm from "./PackageForm";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Truck, User, Percent, CheckCircle, XCircle } from "lucide-react";
import { SelectTrigger } from "@radix-ui/react-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllBookings, adminAcceptBookingApi, cancelBookingApi } from "@/lib/api/bookings";
import { formatDate } from "@/lib/utils";

export default function TourPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotes, setselectedNotes] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPackages();
      const list = Array.isArray(res) ? res : res?.packages || res?.data || [];
      setPackages(list);
    } catch (err: any) {
      console.error("Failed to load packages", err);
      toast({ title: "Failed to load packages", description: String(err) });
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const res = await getAllBookings();
      const list = Array.isArray(res) ? res : res?.data || [];
      setBookings(list.filter((b: any) => b.bookingType === "PACKAGE"));
    } catch (err: any) {
      console.error("Failed to load package bookings", err);
    }
  };

  useEffect(() => {
    load();
    loadBookings();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (p: any) => {
    setEditing(p);
    setDialogOpen(true);
  };

  const handleSaved = () => {
    load();
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this package?")) return;
    try {
      await deletePackage(id);
      toast({ title: "Deleted" });
      load();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Delete failed", description: String(err) });
    }
  };

  const filtered = packages
    .filter((p) => p.isActive !== false)
    .filter((p) => {
      if (typeFilter && p.type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          (p.title || "").toLowerCase().includes(q) ||
          (p.locations?.join(" ") || "").toLowerCase().includes(q) ||
          (p.state || "").toLowerCase().includes(q)
        );
      }
      return true;
    });

  return (
    <div className="p-6">
      <Tabs defaultValue="packages" className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-semibold">Tour Packages Management</h1>
          <TabsList className="bg-slate-100 rounded-lg p-1">
            <TabsTrigger value="packages" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Packages</TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Bookings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="packages" className="mt-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3 items-center w-full sm:w-auto">

              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-w-[200px]"
              />

              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v || undefined)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={openCreate} className="flex items-center gap-2">
                <Plus /> Add Package
              </Button>
            </div>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <Card
                  key={p._id || p.id}
                  className="p-0 overflow-hidden rounded-xl shadow-md"
                >
                  <div className="relative">
                    <div className="h-48 w-full bg-gray-100">
                      {(p?.mainImage || p?.images?.[0]) ? (
                        <img
                          src={p.mainImage || p.images?.[0]}
                          alt={p?.title || "Package image"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    {p.discount ? (
                      <div className="absolute top-3 left-3 bg-white/90 rounded-full px-3 py-1 flex items-center gap-2 text-sm font-semibold">
                        <Percent className="w-4 h-4 text-rose-500" />
                        <span className="text-rose-600">{p.discount}%</span>
                      </div>
                    ) : null}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="bg-white/90 rounded-md p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id || p.id)}
                        className="bg-white/90 rounded-md p-2"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {p.locations?.[0]}
                      {p.state ? `, ${p.state}` : ""}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold">₹{p.price}</div>
                      <div className="text-xs px-2 py-1 bg-slate-100 rounded-full">
                        {p.type}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                      {p.includesCab && (
                        <div className="flex items-center gap-1">
                          <Truck className="w-4 h-4" /> <span>Cab</span>
                        </div>
                      )}
                      {p.includesGuide && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" /> <span>Guide</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="mt-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Tourist</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Package / Tour Date</th>
                    <th className="px-4 py-3 font-semibold">Group Size</th>
                    <th className="px-4 py-3 font-semibold">Total Price</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Notes</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bookings.length > 0 ? (
                    bookings.map((b) => (
                      <tr key={b._id || b.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{b.touristName}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <div>{b.email}</div>
                          <div className="text-xs text-slate-400">{b.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <div className="font-medium text-slate-900">{b.tourType || "Package Tour"}</div>
                          <div className="text-xs">{formatDate(b.bookingDate)}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{b.groupSize}</td>
                        <td className="px-4 py-3 text-slate-900 font-semibold">₹{b.totalPrice}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                              b.status === "ACCEPTED" || b.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                              {b.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${b.paymentStatus === "COMPLETED" ? "bg-green-100 text-green-700" :
                              "bg-slate-100 text-slate-600"
                              }`}>
                              Payment: {b.paymentStatus || "PENDING"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {b.notes ? (
                            <button
                              onClick={() => setselectedNotes(b.notes)}
                              className="bg-gray-100 p-1 rounded-md border border-gray-400 cursor-pointer hover:text-blue-800"
                            >
                              View Notes
                            </button>
                          ) : (
                            <div>No notes</div>
                          )}

                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {b.status === "PENDING" && (
                              <Button
                                size="sm"
                                className="h-8 bg-green-600 hover:bg-green-700"
                                onClick={async () => {
                                  try {
                                    await adminAcceptBookingApi(b._id || b.id);
                                    toast({ title: "Booking Accepted" });
                                    loadBookings();
                                  } catch (err: any) {
                                    toast({ title: "Error accepting booking", description: String(err), variant: "destructive" });
                                  }
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" /> Accept
                              </Button>
                            )}
                            {b.status !== "CANCELLED" && b.status !== "REJECTED" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8"
                                onClick={async () => {
                                  if (!confirm("Cancel this booking?")) return;
                                  try {
                                    await cancelBookingApi(b._id || b.id, "Cancelled by Admin");
                                    toast({ title: "Booking Cancelled" });
                                    loadBookings();
                                  } catch (err: any) {
                                    toast({ title: "Error cancelling booking", description: String(err), variant: "destructive" });
                                  }
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        No package bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

            </div>
          </div>
          {selectedNotes && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">

                <h2 className="text-lg font-semibold mb-3">Notes</h2>

                <p className="text-slate-700">{selectedNotes}</p>

                <button
                  onClick={() => setselectedNotes(null)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Close
                </button>

              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogTitle className="hidden">Package Form</DialogTitle>{" "}
          <PackageForm
            existing={editing}
            onSuccess={handleSaved}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
