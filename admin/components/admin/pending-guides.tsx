"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getPendingGuides } from "@/lib/api/adminDashboard";
import { UserCheck, Mail, Phone, Calendar, Star, Check, X } from "lucide-react";

interface PendingGuide {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  bio: string;
  appliedAt: string;
}

export function PendingGuides() {
  const [guides, setGuides] = useState<PendingGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingGuides = async () => {
      try {
        setLoading(true);
        const data = await getPendingGuides(5);
        setGuides(data);
      } catch (error) {
        console.error("Failed to fetch pending guides:", error);
        setError("Failed to load pending guides");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingGuides();
  }, []);

  const handleVerifyGuide = async (guideId: string) => {
    try {
      setProcessing(guideId);
      // TODO: Implement verify guide API call
      console.log("Verifying guide:", guideId);

      // For now, just remove from the list
      setGuides(prev => prev.filter(g => g.id !== guideId));
    } catch (error) {
      console.error("Failed to verify guide:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectGuide = async (guideId: string) => {
    try {
      setProcessing(guideId);
      // TODO: Implement reject guide API call
      console.log("Rejecting guide:", guideId);

      // For now, just remove from the list
      setGuides(prev => prev.filter(g => g.id !== guideId));
    } catch (error) {
      console.error("Failed to reject guide:", error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">Pending Guides</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Guide verification requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <div className="animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                </div>
                <div className="flex-1 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-1"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">Pending Guides</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Guide verification requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base">Pending Guides</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Guide verification requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {guides.length === 0 ? (
            <div className="text-center py-6">
              <UserCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No pending guides</p>
            </div>
          ) : (
            guides.map((guide) => (
              <div key={guide.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-warning/10 text-warning text-sm">
                    {guide.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{guide.name}</p>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-1">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{guide.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>{guide.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {guide.specialization || 'General'}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3" />
                      <span>{guide.experience} yrs exp</span>
                    </div>
                  </div>
                  {guide.bio && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{guide.bio}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      Applied {new Date(guide.appliedAt).toLocaleDateString()}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleRejectGuide(guide.id)}
                        disabled={processing === guide.id}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs bg-success hover:bg-success/90"
                        onClick={() => handleVerifyGuide(guide.id)}
                        disabled={processing === guide.id}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}