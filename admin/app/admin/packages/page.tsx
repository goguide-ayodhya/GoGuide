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
import { Search, Plus, Trash2, Edit, Truck, User, Percent } from "lucide-react";
import { SelectTrigger } from "@radix-ui/react-select";

export default function TourPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    load();
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

  const filtered = packages.filter((p) => {
    if (typeFilter && p.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (p.title || "").toLowerCase().includes(q) ||
        (p.location || "").toLowerCase().includes(q) ||
        (p.state || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Tour Packages</h1>

        <div className="flex gap-3 items-center">
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
                  <img
                    src={p.mainImage || (p.images && p.images[0])}
                    className="w-full h-full object-cover"
                  />
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
                  {p.location}
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
