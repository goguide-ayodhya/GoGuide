"use client";

import { useDriver } from "@/contexts/DriverContext";
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
import { Badge } from "@/components/ui/badge";
import { DriverAvailabilityToggle } from "@/app/driver/components/driver-availability-toggle";
import { DriverStatusCard } from "@/app/driver/components/driver-status-card";
import { Upload, Save, Lock, X, Car, User, MapPin, FileText, Star } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { assets } from "@/public/assets/assets";
import { useReview } from "@/contexts/ReviewContext";
import { changePassword } from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";
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
    phone: user?.phone || myDriver?.phone || "",
    vehicleType: myDriver?.vehicleType || "",
    vehicleName: myDriver?.vehicleName || "",
    vehicleNumber: myDriver?.vehicleNumber || "",
    seats: myDriver?.seats || 4,
    driverLicenseName: myDriver?.driverLicenseName || "",
    driverLicenseImages: myDriver?.driverLicenseImage || [],
    driverPhoto: myDriver?.driverPhoto || "",
    yearsOfExperience: myDriver?.totalRides || 0,
    languages: (myDriver?.languages || []) as string[],
    reviews: myDriver?.totalRides,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [newLanguage, setNewLanguage] = useState("");
  const [selectedLicenseImages, setSelectedLicenseImages] = useState<File[]>([]);
  const [selectedDriverPhoto, setSelectedDriverPhoto] = useState<File | null>(null);
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
  const driverPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const licenseInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  // Sync form as soon as driver profile is available
  useEffect(() => {
    if (!myDriver) return;
    setFormData({
      name: user?.name || myDriver.name || "",
      email: user?.email || myDriver.email || "",
      phone: user?.phone || myDriver.phone || "",
      vehicleType: myDriver.vehicleType || "",
      vehicleName: myDriver.vehicleName || "",
      vehicleNumber: myDriver.vehicleNumber || "",
      seats: myDriver.seats || 4,
      driverLicenseName: myDriver.driverLicenseName || "",
      driverLicenseImages: myDriver.driverLicenseImage || [],
      driverPhoto: myDriver.driverPhoto || "",
      yearsOfExperience: myDriver.totalRides || 0,
      languages: myDriver.languages || [],
      reviews: myDriver.totalRides,
    });
  }, [myDriver, user]);

  useEffect(() => {
    if (myDriver?.id) {
      getDriverReview(myDriver.id).catch((error) => {
        console.error("Failed to load driver reviews", error);
      });
    }
  }, [myDriver?.id, getDriverReview]);

  const handleSave = async () => {
    if (!myDriver) return;

    if (formData.seats < 1) return;

    const updateData = {
      vehicleType: formData.vehicleType,
      vehicleName: formData.vehicleName,
      vehicleNumber: formData.vehicleNumber,
      seats: formData.seats,
      driverLicenseName: formData.driverLicenseName,
      languages: formData.languages,
      avatar: selectedImage,
      driverPhoto: selectedDriverPhoto,
      driverLicenseImages: [...formData.driverLicenseImages, ...selectedLicenseImages],
      driverName: formData.name,
      phone: formData.phone,
    };

    setLoading(true);
    await updateDriverData(myDriver.id, updateData);
    setLoading(false);

    setIsEditing(false);
    setSelectedLicenseImages([]);
    setSelectedDriverPhoto(null);
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "yearsOfExperience" || name === "seats"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const handleDriverPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return null;
    }
    setSelectedDriverPhoto(file);
  };

  const handleLicenseImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedLicenseImages(files);
  };

  const handleSaveAvatar = async () => {
    if (!myDriver || !selectedImage) return;

    setAvatarLoading(true);
    try {
      const updateData = {
        avatar: selectedImage,
      };

      const result = await updateDriverData(myDriver.id, updateData);

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
                  disabled={true}
                  className="bg-muted border-border opacity-60"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Phone Number
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                  placeholder="Your phone number"
                />
              </div>
              {/* <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Location
                </label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                  placeholder="Your city/area"
                />
              </div> */}
            </div>

            {/* <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full min-h-[100px] px-3 py-2 bg-muted border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Tell tourists about yourself and your services..."
              />
            </div> */}

            {/* {isEditing && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save size={18} />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )} */}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
          <CardDescription>
            Details about your vehicle and transportation services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select vehicle type</option>
                  <option value="CAR">Car</option>
                  <option value="BIKE">Bike</option>
                  <option value="AUTO">Auto Rickshaw</option>
                  <option value="RIKSHAW">Rikshaw</option>
                  <option value="VAN">Van</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Vehicle Name
                </label>
                <Input
                  name="vehicleName"
                  value={formData.vehicleName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                  placeholder="e.g., Toyota Camry, Honda Activa"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Vehicle Number
                </label>
                <Input
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                  placeholder="e.g., MH12AB1234"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Number of Seats
                </label>
                <Input
                  name="seats"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.seats}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                  placeholder="Number of passengers"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Documents */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Professional Documents</CardTitle>
          <CardDescription>Your professional credentials and photos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  License Name
                </label>
                <Input
                  name="driverLicenseName"
                  value={formData.driverLicenseName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                  placeholder="Name as on driving license"
                />
              </div>
            </div>
            {/* Driver Photo */}
            {/* <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Driver Photo
              </label>
              <div className="flex items-center gap-4">
                {formData.driverPhoto && (
                  <div className="relative w-32 aspect-square rounded-lg overflow-hidden border-2 border-border shadow-sm">
                    <Image
                      src={formData.driverPhoto}
                      alt="Driver photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={driverPhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleDriverPhotoChange}
                  />
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => driverPhotoInputRef.current?.click()}
                    disabled={!isEditing}
                  >
                    <Upload size={18} />
                    {formData.driverPhoto ? "Replace Driver Photo" : "Upload Driver Photo"}
                  </Button>
                  {selectedDriverPhoto && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected: {selectedDriverPhoto.name}
                    </p>
                  )}
                </div>
              </div>
            </div> */}

            {/* License Images */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                License Images
              </label>
              {isEditing && (
                <div className="space-y-2 mb-4">
                  <input
                    ref={licenseInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleLicenseImagesChange}
                  />
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => licenseInputRef.current?.click()}
                  >
                    <Upload size={18} />
                    Upload License Images
                  </Button>
                  {selectedLicenseImages.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedLicenseImages.length} new image(s) selected
                    </p>
                  )}
                </div>
              )}

              {formData.driverLicenseImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.driverLicenseImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative group"
                    >
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-border shadow-sm">
                        <Image
                          src={image}
                          alt={`License ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {isEditing && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              driverLicenseImages: prev.driverLicenseImages.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              <div className="space-y-3">
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

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Suggested Languages:</p>
                  <div className="flex flex-wrap gap-2">
                    {["English", "Hindi", "Marathi", "Gujarati", "Bengali", "Tamil", "Telugu", "Kannada", "Malayalam", "French", "Spanish", "German"]
                      .filter(lang => !formData.languages.includes(lang))
                      .map(lang => (
                        <Badge
                          key={lang}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              languages: [...prev.languages, lang]
                            }));
                          }}
                        >
                          + {lang}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>

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
    </div>
  );
}
