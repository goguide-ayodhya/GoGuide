"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "@/lib/api/settings";
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

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Tourist Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account details, contact information, and logout from
            your tourist profile.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant={isEditing ? "destructive" : "secondary"}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
          <Link href={"/"}>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
            <CardDescription>Tourist profile overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border border-border">
                <Image
                  src={user.avatar || assets.guideImage}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">
                  {user.name}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground">Role</p>
                <p className="mt-1 text-muted-foreground">{user.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Phone</p>
                <p className="mt-1 text-muted-foreground">
                  {user.phone || "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>
              Update your name, email, phone number, and bio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Full Name
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="bg-secondary border-border"
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
                    className="bg-secondary border-border"
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
                  className="bg-secondary border-border"
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
                  className="bg-secondary border-border min-h-[140px]"
                />
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
