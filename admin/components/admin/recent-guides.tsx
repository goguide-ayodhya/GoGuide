"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getRecentGuides } from "@/lib/api/adminDashboard";
import { UserCheck, Mail, Phone, Calendar, Star } from "lucide-react";

interface RecentGuide {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  joinedAt: string;
}

export function RecentGuides() {
  const [guides, setGuides] = useState<RecentGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentGuides = async () => {
      try {
        setLoading(true);
        const data = await getRecentGuides(5);
        setGuides(data);
      } catch (error) {
        console.error("Failed to fetch recent guides:", error);
        setError("Failed to load recent guides");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentGuides();
  }, []);

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">Recent Guides</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Latest verified guides</CardDescription>
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
          <CardTitle className="text-sm sm:text-base">Recent Guides</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Latest verified guides</CardDescription>
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
        <CardTitle className="text-sm sm:text-base">Recent Guides</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Latest verified guides</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {guides.length === 0 ? (
            <div className="text-center py-6">
              <UserCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No recent guides</p>
            </div>
          ) : (
            guides.map((guide) => (
              <div key={guide.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-success/10 text-success text-sm">
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
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {guide.specialization || 'General'}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3" />
                      <span>{guide.experience} yrs exp</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(guide.joinedAt).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}