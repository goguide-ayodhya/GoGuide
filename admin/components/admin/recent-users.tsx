"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getRecentUsers } from "@/lib/api/adminDashboard";
import { User, Mail, Phone, Calendar } from "lucide-react";

interface RecentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedAt: string;
}

export function RecentUsers() {
  const [users, setUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        setLoading(true);
        const data = await getRecentUsers(5);
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch recent users:", error);
        setError("Failed to load recent users");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentUsers();
  }, []);

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">Recent Users</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Latest user registrations</CardDescription>
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
          <CardTitle className="text-sm sm:text-base">Recent Users</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Latest user registrations</CardDescription>
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
        <CardTitle className="text-sm sm:text-base">Recent Users</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Latest user registrations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="text-center py-6">
              <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No recent users</p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(user.joinedAt).toLocaleDateString()}
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