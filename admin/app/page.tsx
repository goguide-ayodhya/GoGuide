"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Lock, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoggedIn, loading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!loading && isLoggedIn && user?.role === "ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [user, isLoggedIn, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show login if already authenticated as admin
  if (isLoggedIn && user?.role === "ADMIN") {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await login({ identifier, password });

      // Check if user is admin
      if (user.role !== "ADMIN") {
        setError("Access denied. Admin privileges required.");
        return;
      }

      router.push("/admin/dashboard");
    } catch (error: any) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4">
            <Image
              src="/goguide.svg"
              alt="GoGuide Logo"
              width={64}
              height={64}
            />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            GoGuide - Ayodhya
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your tour guide platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your admin account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Phone</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter your email or phone"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
