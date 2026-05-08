"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";

export function ProfileCompletionBanner() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show banner for authenticated users with incomplete profiles
    if (isLoggedIn && user && !user.isProfileComplete) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user, isLoggedIn]);

  if (!isVisible || !user) return null;

  const getSignupPath = () => {
    switch (user.role) {
      case "GUIDE":
        return "/signup/goguide-guide";
      case "DRIVER":
        return "/signup/goguide-driver";
      default:
        return "/signup";
    }
  };

  const getRoleName = () => {
    switch (user.role) {
      case "GUIDE":
        return "Guide";
      case "DRIVER":
        return "Driver";
      default:
        return "Professional";
    }
  };

  const handleContinueSignup = () => {
    router.push(getSignupPath());
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-blue-900">
                  Complete Your {getRoleName()} Profile
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {user.role}
                </Badge>
              </div>
              <p className="text-sm text-blue-700">
                Finish setting up your profile to start accepting bookings and earn money.
              </p>
            </div>
          </div>
          <Button
            onClick={handleContinueSignup}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            Continue Signup
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
