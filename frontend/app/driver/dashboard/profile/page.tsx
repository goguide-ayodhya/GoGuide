"use client";

import { useDriver } from "@/contexts/DriverContext";
import { ChangeEvent, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DriverAvailabilityToggle } from "@/app/driver/components/driver-availability-toggle";
import { DriverStatusCard } from "@/app/driver/components/driver-status-card";
import { Upload, Save, Star } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { assets } from "@/public/assets/assets";
import { useReview } from "@/contexts/ReviewContext";
import { useEffect } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { myDriver, updateDriverData } = useDriver();
  const { user } = useAuth();
  const { reviews, getDriverReview } = useReview();
  const [isEditing, setIsEditing] = useState(false);
  const isDisabled = myDriver?.verificationStatus === "REJECTED";
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    vehicleType: myDriver?.vehicleType || "",
    certification: myDriver?.driverAadhar || "",
    yearsOfExperience: myDriver?.totalRides || 0,
    languages: [] as string[],
    pricePerKm: myDriver?.pricePerKm || 0,
    reviews: myDriver?.totalRides,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (myDriver?.id) {
      getDriverReview(myDriver.id).catch((error) => {
        console.error("Failed to load driver reviews", error);
      });
    }
  }, [myDriver?.id, getDriverReview]);

  const handleSave = async () => {
    if (!myDriver) return;

    const form = new FormData();
    if (!formData.name.trim()) return;
    if (formData.pricePerKm < 0) return;

    form.append("vehicleType", formData.vehicleType);
    form.append("driverAadhar", formData.certification);
    form.append("pricePerKm", String(formData.pricePerKm));

    formData.languages.forEach((lang) => {
      form.append("languages[]", lang);
    });

    if (selectedImage) {
      form.append("avatar", selectedImage);
    }

    setLoading(true);
    await updateDriverData(myDriver.id, form);
    setLoading(false);

    setIsEditing(false);
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "yearsOfExperience" || name === "pricePerKm"
          ? parseInt(value)
          : value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return null;
    }
    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
  };

  if (!user) return null;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your driver profile and preferences
          </p>
        </div>
        <Button
          disabled={isDisabled}
          onClick={() => setIsEditing(!isEditing)}
          className={
            isEditing
              ? "bg-red-500/20 text-red-600 hover:bg-red-500/30"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DriverStatusCard driver={undefined} />
        <DriverAvailabilityToggle driver={undefined} />
      </div>

      {/* Profile Picture */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Upload or change your profile photo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center border-2 border-border">
              <Image
                src={
                  previewImage
                    ? previewImage
                    : user.avatar
                      ? user.avatar
                      : assets.guideImage
                }
                alt={user.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              <Button
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                Upload New Picture
              </Button>

              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG or GIF (max 5MB)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Full Name
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing || isDisabled}
                  className="bg-muted border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Vehicle Details
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Vehicle:</span> {myDriver?.vehicleName || 'Not set'}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Plate:</span> {myDriver?.vehicleNumber || 'Not set'}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Seats:</span> {myDriver?.seats || 'Not set'}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save size={18} />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>
            Your driver credentials and expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Vehicle Type
                </label>
                <Input
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                  placeholder="e.g., SUV, Sedan, Van"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Driver Aadhar
                </label>
                <Input
                  name="certification"
                  value={formData.certification}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                  placeholder="Aadhar number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Total Rides
                </label>
                <Input
                  name="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  disabled={true}
                  className="bg-muted border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Price per Kilometer ($)
                </label>
                <Input
                  name="pricePerKm"
                  type="number"
                  value={formData.pricePerKm}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save size={18} />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tourist Reviews</CardTitle>
              <CardDescription>
                Feedback from tourists who booked your rides
              </CardDescription>
            </div>
            <Link href="/driver/dashboard/reviews">
              <Button variant="outline" size="sm">
                View All Reviews
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reviews && reviews.length > 0 ? (
              reviews.slice(0, 3).map((review) => (
                <div
                  key={review.id}
                  className="pb-6 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        Tourist Review
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Booking ID: {review.bookingId}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {review.comments}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No reviews yet. Complete some rides to receive feedback!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
