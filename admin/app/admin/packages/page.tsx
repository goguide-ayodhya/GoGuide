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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Plus,
  MapPin,
  Calendar,
  IndianRupee,
  Trash2,
  Edit,
} from "lucide-react";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "@/lib/api/tourPackages";

interface TourPackage {
  _id: string;
  title: string;
  location: string;
  duration: number;
  price: number;
  image: string;
  description: string;
  includes: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  title: string;
  location: string;
  duration: number;
  price: number;
  image: string;
  description: string;
  includes: string;
}

const initialFormData: FormData = {
  title: "",
  location: "",
  duration: 0,
  price: 0,
  image: "",
  description: "",
  includes: "",
};

export default function TourPackagesPage() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPackages();
      // Handle both array and object response with data property
      const packageList = Array.isArray(response)
        ? response
        : response?.data || [];
      setPackages(packageList);
    } catch (err: any) {
      console.error("Failed to fetch packages:", err);
      setError(err.message || "Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "duration" || name === "price"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.location || !formData.description) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare package data
      const packageData = {
        title: formData.title,
        location: formData.location,
        duration: formData.duration,
        price: formData.price,
        image: formData.image || "https://via.placeholder.com/400x300",
        description: formData.description,
        includes: formData.includes
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item),
      };

      if (editingId) {
        // Update
        await updatePackage(editingId, packageData);
      } else {
        // Create
        await createPackage(packageData);
      }

      // Reset form and close dialog
      setFormData(initialFormData);
      setEditingId(null);
      setIsDialogOpen(false);

      // Refresh packages
      await fetchPackages();
    } catch (err: any) {
      console.error("Failed to save package:", err);
      setSubmitError(err.message || "Failed to save package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (pkg: TourPackage) => {
    setFormData({
      title: pkg.title,
      location: pkg.location,
      duration: pkg.duration,
      price: pkg.price,
      image: pkg.image,
      description: pkg.description,
      includes: pkg.includes?.join(", ") || "",
    });
    setEditingId(pkg._id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePackage(id);
      setPackages((prev) => prev.filter((pkg) => pkg._id !== id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error("Failed to delete package:", err);
      setError(err.message || "Failed to delete package");
    }
  };

  const handleOpenDialog = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setSubmitError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setEditingId(null);
    setSubmitError(null);
  };

  const filteredPackages = packages.filter((pkg) => {
    const query = searchQuery.toLowerCase();
    return (
      pkg.title.toLowerCase().includes(query) ||
      pkg.location.toLowerCase().includes(query) ||
      pkg.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            Tour Packages Management
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Create, manage, and organize tour packages for tourists.
          </p>
        </div>
        <Button
          onClick={handleOpenDialog}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <Card className="border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading packages...</p>
        </div>
      )}

      {/* Packages Grid */}
      {!loading && (
        <div>
          {filteredPackages.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No packages found" : "No packages yet"}
                </p>
                {!searchQuery && (
                  <Button onClick={handleOpenDialog} variant="outline">
                    Create First Package
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPackages.map((pkg) => (
                <Card key={pkg._id} className="border-border overflow-hidden flex flex-col">
                  {/* Image */}
                  <div className="w-full h-40 sm:h-48 bg-muted overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x300?text=Package+Image";
                      }}
                    />
                  </div>

                  {/* Content */}
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2">
                        {pkg.title}
                      </h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(pkg)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteConfirmId(pkg._id)}
                            className="flex items-center gap-2 cursor-pointer text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{pkg.location}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                      {pkg.description}
                    </p>

                    {/* Duration and Price */}
                    <div className="flex items-center justify-between mb-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{pkg.duration} days</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                        <IndianRupee className="w-4 h-4" />
                        <span>{pkg.price.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Includes */}
                    {pkg.includes && pkg.includes.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Includes:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {pkg.includes.slice(0, 2).map((item, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {item}
                            </Badge>
                          ))}
                          {pkg.includes.length > 2 && (
                            <Badge
                              variant="secondary"
                              className="text-[10px]"
                            >
                              +{pkg.includes.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Update Package" : "Create New Package"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the package details below."
                : "Add a new tour package to the platform."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {submitError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {submitError}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Package Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Taj Mahal Heritage Tour"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., Agra"
                value={formData.location}
                onChange={handleFormChange}
                required
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                placeholder="e.g., 3"
                value={formData.duration}
                onChange={handleFormChange}
                min="1"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="e.g., 25000"
                value={formData.price}
                onChange={handleFormChange}
                min="0"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={handleFormChange}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the package, itinerary, and highlights..."
                value={formData.description}
                onChange={handleFormChange}
                rows={4}
                required
              />
            </div>

            {/* Includes */}
            <div className="space-y-2">
              <Label htmlFor="includes">
                What's Included (comma-separated)
              </Label>
              <Textarea
                id="includes"
                name="includes"
                placeholder="e.g., Hotel stay, Meals, Guided tours, Travel insurance"
                value={formData.includes}
                onChange={handleFormChange}
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingId
                    ? "Update Package"
                    : "Create Package"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this package? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirmId && handleDelete(deleteConfirmId)
              }
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
