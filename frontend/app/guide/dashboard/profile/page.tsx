"use client";

import { useGuide } from "@/contexts/GuideContext";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuideAvailabilityToggle } from "@/components/guide-availability-toggle";
import { GuideStatusCard } from "@/components/guide-status-card";
import { Upload, Save, Star } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { assets } from "@/public/assets/assets";

export default function ProfilePage() {
  const { myGuide, updateGuideData } = useGuide();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const isDisabled = myGuide?.verificationStatus === "REJECTED";
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync form as soon as guide profile is available
  useEffect(() => {
    if (!myGuide) return;
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
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
  }, [myGuide, user]);

  const handleSave = async () => {
    if (!myGuide) return;

    const form = new FormData();
    if (!formData.name.trim()) return;
    if (formData.hourlyRate < 0) return;

    form.append("speciality", formData.speciality);
    form.append("bio", formData.bio);
    form.append("certification", formData.certification);
    form.append("hourlyRate", String(formData.hourlyRate));
    form.append("yearsOfExperience", String(formData.yearsOfExperience));

    formData.languages.forEach((lang) => {
      form.append("languages[]", lang);
    });

    if (selectedImage) {
      form.append("avatar", selectedImage);
    }

    setLoading(true);
    await updateGuideData(myGuide.id, form);
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
        <GuideStatusCard />
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
              {/* {user.avatar && ( */}
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
              {/* )} */}
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
                  className="bg-secondary border-border"
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
                  className="bg-secondary border-border"
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
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground disabled:opacity-50"
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
                  className="bg-secondary border-border"
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
                  className="bg-secondary border-border"
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
                  className="bg-secondary border-border"
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
                  className="bg-secondary border-border"
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
                  className="bg-secondary border-border"
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
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Connected Devices
            </Button>
            <div className="border-t border-border pt-4 mt-4">
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-500/10 w-full justify-start"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Tourist Reviews</CardTitle>
          <CardDescription>
            Feedback from tourists who booked your tours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* {myGuide.reviews && mockReviews.length > 0 ? (
              mockReviews.map((review, idx) => (
                <div
                  key={idx}
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
                  No reviews yet. Complete some tours to receive feedback!
                </p>
              </div>
            )} */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
