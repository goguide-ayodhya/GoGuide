"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "@/lib/api/settings";
import { changePassword, sendOtp, verifyEmail } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { assets } from "@/public/assets/assets";
import Link from "next/dist/client/link";
import { Upload, Save, Lock } from "lucide-react";
import { Header } from "@/components/common/Header";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerificationLoading, setEmailVerificationLoading] =
    useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      bio: user.bio || "",
    });
  }, [user]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    if (!user || !selectedImage) return;

    // For now, we'll just show a toast since avatar update might need backend implementation
    toast({
      title: "Feature Coming Soon",
      description: "Profile picture upload will be available soon.",
    });

    setSelectedImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await updateProfile(formData);
      const updatedData = result?.data?.user || result?.data || result;

      if (updatedData) {
        updateUser(updatedData);
      }

      toast({
        title: "Profile updated",
        description: "Your personal details were saved successfully.",
      });
      setIsEditing(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not save your profile.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const handleSendEmailVerification = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "No email address found in your profile",
        variant: "destructive",
      });
      return;
    }

    setEmailVerificationLoading(true);
    try {
      await sendOtp(user.email);
      toast({
        title: "OTP Sent",
        description: "Verification OTP sent to your email",
      });
      setShowEmailVerification(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user?.email || !emailOtp) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive",
      });
      return;
    }

    setEmailVerificationLoading(true);
    try {
      await verifyEmail(user.email, emailOtp);
      toast({
        title: "Success",
        description: "Email verified successfully",
      });
      // Update user context to reflect verified email
      updateUser({ ...user, isEmailVerified: true });
      setShowEmailVerification(false);
      setEmailOtp("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify email",
        variant: "destructive",
      });
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Header />
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Profile Settings
          </h1>
          <p className="hidden sm:block text-muted-foreground mt-2">
            Manage your tourist profile and preferences
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={isEditing ? "destructive" : "secondary"}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
          <Link href="/">
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </Link>
        </div>
      </div>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}

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
                    disabled={!isEditing}
                    className="bg-muted border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Email Address
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
                  Phone Number
                </label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Bio
                </label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-muted border-border min-h-[140px]"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={loading}
                  >
                    <Save size={18} />
                    {loading ? "Saving..." : "Save Changes"}
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

              {/* Email Verification */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      {user.isEmailVerified
                        ? "Your email is verified"
                        : "Verify your email for better security"}
                    </p>
                  </div>
                  {user.isEmailVerified ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="text-sm font-medium">Verified</span>
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleSendEmailVerification}
                      disabled={emailVerificationLoading}
                    >
                      {emailVerificationLoading ? "Sending..." : "Verify Email"}
                    </Button>
                  )}
                </div>

                {showEmailVerification && !user.isEmailVerified && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Enter OTP sent to {user.email}
                      </label>
                      <Input
                        type="text"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        className="bg-muted border-border"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleVerifyEmail}
                        disabled={emailVerificationLoading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {emailVerificationLoading ? "Verifying..." : "Verify"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowEmailVerification(false);
                          setEmailOtp("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
