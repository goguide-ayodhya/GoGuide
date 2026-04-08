"use client";

import { useGuide } from "@/contexts/GuideContext";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useReview } from "@/contexts/ReviewContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuideAvailabilityToggle } from "@/components/guide-availability-toggle";
import { GuideStatusCard } from "@/components/guide-status-card";
import { Upload, Save, Star, Lock } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { assets } from "@/public/assets/assets";
import { changePassword } from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { myGuide, updateGuideData } = useGuide();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const isDisabled = myGuide?.verificationStatus === "REJECTED";
  const [formData, setFormData] = useState({
    bio: myGuide?.bio || "",
    speciality: Array.isArray(myGuide?.specialities)
      ? myGuide?.specialities[0] || ""
      : myGuide?.specialities || "",
    certification: myGuide?.certification || "",
    yearsOfExperience: myGuide?.yearsOfExperience || 0,
    languages: (myGuide?.languages || []) as string[],
    hourlyRate: myGuide?.hourlyRate || 0,
    reviews: myGuide?.totalReviews,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [newLanguage, setNewLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const { reviews, getGuideReview } = useReview();

  // Sync form as soon as guide profile is available
  useEffect(() => {
    if (!myGuide) return;
    setFormData({
      bio: myGuide.bio || "",
      speciality: Array.isArray(myGuide.specialities)
        ? myGuide.specialities[0] || ""
        : myGuide.specialities?.[0] || "",
      certification: myGuide.certification || "",
      yearsOfExperience: myGuide.yearsOfExperience || 0,
      languages: myGuide.languages || [],
      hourlyRate: myGuide.hourlyRate || 0,
      reviews: myGuide.totalReviews,
    });
  }, [myGuide]);

  useEffect(() => {
    if (myGuide?.id) {
      getGuideReview(myGuide.id).catch((error) => {
        console.error("Unable to load guide reviews", error);
      });
    }
  }, [myGuide?.id, getGuideReview]);

  const handleSave = async () => {
    if (!myGuide) return;

    if (formData.hourlyRate < 0) return;

    const updateData = {
      speciality: formData.speciality,
      bio: formData.bio,
      certification: formData.certification,
      hourlyRate: formData.hourlyRate,
      yearsOfExperience: formData.yearsOfExperience,
      languages: formData.languages,
      avatar: selectedImage,
    };

    setLoading(true);
    await updateGuideData(myGuide.id, updateData);
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
        name === "yearsOfExperience" || name === "hourlyRate"
          ? parseInt(value)
          : value,
    }));
  };

  const addLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage],
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
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

  const handleSaveAvatar = async () => {
    if (!myGuide || !selectedImage) return;

    setAvatarLoading(true);
    try {
      const updateData = {
        avatar: selectedImage,
      };

      const result = await updateGuideData(myGuide.id, updateData);

      // Update localStorage with new user data for persistence
      if (result.userId?.avatar) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const updatedUser = JSON.parse(storedUser);
          updatedUser.avatar = result.userId.avatar;
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });

      setSelectedImage(null);
      setPreviewImage(null);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Failed to save avatar:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update avatar",
        variant: "destructive",
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  useEffect(() => {
    if (myGuide?.id) {
      getGuideReview(myGuide.id).catch((error) => {
        console.error("Unable to load guide reviews", error);
      });
    }
  }, [myGuide?.id, getGuideReview]);

  const handleChangePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!/[A-Z]/.test(passwordData.newPassword)) {
      toast({
        title: "Error",
        description: "New password must contain at least one uppercase letter",
        variant: "destructive",
      });
      return;
    }

    if (!/[0-9]/.test(passwordData.newPassword)) {
      toast({
        title: "Error",
        description: "New password must contain at least one number",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
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
            Manage your guide profile and preferences
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
        <GuideAvailabilityToggle />
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
                    : myGuide?.image
                      ? myGuide.image
                      : user.avatar
                        ? user.avatar
                        : assets.guideImage
                }
                alt={user.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={18} />
                  Upload New Picture
                </Button>

                {selectedImage && (
                  <Button
                    onClick={handleSaveAvatar}
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={avatarLoading}
                  >
                    <Save size={18} />
                    {avatarLoading ? "Saving..." : "Save Avatar"}
                  </Button>
                )}
              </div>

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
          <CardDescription>Your account details and bio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Full Name
                </label>
                <Input
                  value={user.name}
                  disabled
                  className="bg-muted border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Email
                </label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-muted border-border"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground disabled:opacity-50"
                placeholder="Tell travelers about your experience and style..."
              />
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
            Your tour guide credentials and expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Speciality
                </label>
                <Input
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                  placeholder="e.g., Historical Tours"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Certification
                </label>
                <Input
                  name="certification"
                  value={formData.certification}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                  placeholder="e.g., IFTA Certified"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Years of Experience
                </label>
                <Input
                  name="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Hourly Rate ($)
                </label>
                <Input
                  name="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
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

      {/* Languages */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Languages</CardTitle>
          <CardDescription>Languages you speak fluently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.languages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang) => (
                  <div
                    key={lang}
                    className="px-3 py-2 bg-primary/10 rounded-lg flex items-center gap-2"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {lang}
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => removeLanguage(lang)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Add a language"
                  className="bg-muted border-border"
                  onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                />
                <Button onClick={addLanguage} variant="outline">
                  Add
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!showPasswordChange ? (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setShowPasswordChange(true)}
              >
                <Lock size={18} />
                Change Password
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="bg-muted border-border"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="bg-muted border-border"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="bg-muted border-border"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleChangePassword}
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={passwordLoading}
                  >
                    <Save size={18} />
                    {passwordLoading ? "Changing..." : "Change Password"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card className="bg-card border border-border">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Tourist Reviews</CardTitle>
            <CardDescription>
              Feedback from tourists who booked your tours
            </CardDescription>
          </div>
          <Link href="/guide/dashboard/reviews">
            <Button size="sm" variant="outline" className="gap-2">
              View All Reviews
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
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
                      <p className="text-xs text-muted-foreground mt-1">
                        Review Date: {new Date(review.createdAt).toLocaleDateString()}
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
                  No reviews yet. Complete some tours to receive feedback!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
