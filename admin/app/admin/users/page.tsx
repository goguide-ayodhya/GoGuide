"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, QrCode } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

import {
  getUsersApi,
  blockUserApi,
  activateUserApi,
  suspendUserApi,
  deleteUserApi,
  verifyUserApi,
  getUserDetailApi,
  markUserAsViewedApi,
} from "@/lib/api/admin";
import {
  regenerateReviewQR,
  toggleReviewCollection,
} from "@/lib/api/guides";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const isNewUser = (createdAt: string): boolean => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(createdAt) > sevenDaysAgo;
};

type AdminRole = "GUIDE" | "DRIVER" | "TOURIST" | "ADMIN";

type AdminUser = {
  isViewedByAdmin: any;
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: string;
  phone?: string;
  lastLoginAt?: string;
  verificationStatus?: string;
  isAvailable?: boolean;
  profileStep?: number | null;
  isProfileComplete?: boolean;
  createdAt: string;
};

const roleOptions: Array<{ key: "all" | AdminRole; label: string }> = [
  { key: "all", label: "All Users" },
  { key: "GUIDE", label: "Guides" },
  { key: "DRIVER", label: "Drivers" },
  { key: "TOURIST", label: "Tourists" },
];

const statusOptions = [
  { key: "all", label: "All Statuses" },
  { key: "ACTIVE", label: "Active" },
  { key: "BLOCKED", label: "Blocked" },
  { key: "SUSPENDED", label: "Suspended" },
  { key: "DELETED", label: "Deleted" },
];

const verificationOptions = [
  { key: "all", label: "All Verification" },
  { key: "VERIFIED", label: "Verified" },
  { key: "UNVERIFIED", label: "Unverified" },
];

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BLOCKED: "Blocked",
  SUSPENDED: "Suspended",
  DELETED: "Deleted",
};

const getVerificationBadge = (status: string) => {
  if (status === "VERIFIED")
    return (
      <Badge
        className="bg-secondary text-primary-foreground border-success/20 text-[10px] sm:text-xs"
        variant="outline"
      >
        VERIFIED
      </Badge>
    );
  if (status === "PENDING")
    return (
      <Badge
        className="bg-warning text-warning-foreground border-warning/20 text-[10px] sm:text-xs"
        variant="outline"
      >
        PENDING
      </Badge>
    );
  if (status === "REJECTED")
    return (
      <Badge
        className="bg-destructive text-white border-destructive/20 text-[10px] sm:text-xs"
        variant="outline"
      >
        REJECTED
      </Badge>
    );
  return (
    <Badge
      className="bg-muted text-muted-foreground border-border text-[10px] sm:text-xs"
      variant="outline"
    >
      PENDING
    </Badge>
  );
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;

  return (
    <div>
      <p className="text-muted-foreground text-xs mb-1">{label}</p>

      <div className="font-medium">{value}</div>
    </div>
  );
}

function BadgeList({
  label,
  items,
  variant = "secondary",
}: {
  label: string;
  items: any[];
  variant?: "default" | "secondary" | "outline";
}) {
  if (!items?.length) return null;

  return (
    <div>
      <p className="text-muted-foreground text-xs mb-1">{label}</p>

      <div className="flex flex-wrap gap-1">
        {items.map((item, index) => (
          <Badge key={index} variant={variant} className="text-[10px]">
            {typeof item === "string"
              ? item
              : item?.name || item?.title || "Item"}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default function GuidesPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminRole>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [regeneratingQR, setRegeneratingQR] = useState(false);
  const [togglingCollection, setTogglingCollection] = useState(false);

  const handleRegenerateQR = async (guideId: string) => {
    if (!window.confirm("Are you sure you want to regenerate this guide's review QR token? The old QR code and review link will stop working.")) {
      return;
    }
    setRegeneratingQR(true);
    try {
      const result = await regenerateReviewQR(guideId);
      if (result?.reviewQRToken) {
        setSelectedUserDetails((prev: any) => ({
          ...prev,
          providerDetails: {
            ...prev.providerDetails,
            reviewQRToken: result.reviewQRToken,
          },
        }));
        window.alert("Review QR token regenerated successfully!");
      }
    } catch (err: any) {
      window.alert(err.message || "Failed to regenerate QR token");
    } finally {
      setRegeneratingQR(false);
    }
  };

  const handleToggleCollection = async (guideId: string) => {
    setTogglingCollection(true);
    try {
      const result = await toggleReviewCollection(guideId);
      if (result && result.reviewCollectionEnabled !== undefined) {
        setSelectedUserDetails((prev: any) => ({
          ...prev,
          providerDetails: {
            ...prev.providerDetails,
            reviewCollectionEnabled: result.reviewCollectionEnabled,
          },
        }));
      }
    } catch (err: any) {
      window.alert(err.message || "Failed to toggle review collection");
    } finally {
      setTogglingCollection(false);
    }
  };

  const providerDetails = selectedUserDetails?.providerDetails;
  const driverLicenseImages = Array.isArray(providerDetails?.driverLicenseImage)
    ? providerDetails.driverLicenseImage
    : providerDetails?.driverLicenseImage
      ? [providerDetails.driverLicenseImage]
      : [];

  const fetchUsers = async (
    role: "all" | AdminRole,
    status: string,
    search: string | undefined,
    verification: string,
    page: number
  ) => {
    setLoading(true);
    setError(null);
    setActionError(null);

    try {
      const response = await getUsersApi(role, status, search, verification, page, 20);
      const responseData = response?.data || {};
      const apiUsers = responseData.users || (Array.isArray(response) ? response : response?.data || []);
      const totalCount = responseData.totalCount ?? apiUsers.length;
      const totalP = responseData.totalPages ?? Math.ceil(totalCount / 20);

      const normalizedUsers = apiUsers.map((user: any) => ({
        id: user._id || user.id || "-",
        name: user.name || "Unknown",
        email: user.email || "-",
        role: user.role || "TOURIST",
        status: user.status || "INACTIVE",
        phone: user.phone || undefined,
        lastLoginAt: user.lastLoginAt || undefined,
        verificationStatus:
          user.verificationStatus || user.guideVerificationStatus || undefined,
        isAvailable: user.isAvailable || undefined,
        isProfileComplete: user.isProfileComplete ?? user.profileComplete ?? false,
        profileStep: user.profileStep ?? user.profileCompletionStep ?? null,
        createdAt: user.createdAt || new Date().toISOString(),
      }));

      setUsers(normalizedUsers);
      setTotalUsersCount(totalCount);
      setTotalPages(totalP);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      setError(err.message || "Unable to fetch users");
      setUsers([]);
      setTotalUsersCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, debouncedSearch, verificationFilter]);

  // Trigger fetchUsers when page or filter variables change
  useEffect(() => {
    fetchUsers(roleFilter, statusFilter, debouncedSearch || undefined, verificationFilter, currentPage);
  }, [roleFilter, statusFilter, debouncedSearch, verificationFilter, currentPage]);

  const paginatedUsers = users;
  const filteredByStatus = users; // Server handles filtering and pagination

  const handleUserAction = async (
    action: "activate" | "block" | "suspend" | "delete" | "verify" | "unverify",
    userId: string,
    duration?: string,
  ) => {
    setActionLoading(userId);
    setActionError(null);

    try {
      let result: any;

      switch (action) {
        case "activate":
          result = await activateUserApi(userId);
          break;
        case "block":
          result = await blockUserApi(userId);
          break;
        case "suspend":
          result = await suspendUserApi(userId, duration);
          break;
        case "verify":
          result = await verifyUserApi(userId);
          break;
        // case "unverify":
        //   result = await unverifyUserApi(userId)
        //   break
        case "delete":
          result = await deleteUserApi(userId);
          break;
      }

      if (result?.success === false) {
        throw new Error(result.message || "Action failed");
      }

      await fetchUsers(roleFilter, statusFilter, debouncedSearch || undefined, verificationFilter, currentPage);
    } catch (err: any) {
      console.error(`Failed to ${action} user:`, err);
      setActionError(err.message || `Unable to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRowClick = async (userId: string) => {
    setIsProfileOpen(true);
    setProfileLoading(true);
    try {
      // Mark user as viewed by admin
      await markUserAsViewedApi(userId);

      // Update local state to remove "New" badge immediately
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isViewedByAdmin: true } : user
        )
      );

      const details = await getUserDetailApi(userId);
      setSelectedUserDetails(details?.data || details);
    } catch (err) {
      console.error("Failed to load user details", err);
      setSelectedUserDetails(null);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          User Management
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Manage platform users and filter by Guides, Drivers, or Tourists.
        </p>
      </div>

      <Card className="border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Role
                </label>
                <Select
                  value={roleFilter}
                  onValueChange={(val: any) => setRoleFilter(val)}
                >
                  <SelectTrigger className="w-full h-10 bg-background">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full h-10 bg-background">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Verification
                </label>
                <Select
                  value={verificationFilter}
                  onValueChange={setVerificationFilter}
                >
                  <SelectTrigger className="w-full h-10 bg-background">
                    <SelectValue placeholder="Select Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    {verificationOptions.map((v) => (
                      <SelectItem key={v.key} value={v.key}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}
      {actionError && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2 sm:pb-4">
              <Skeleton className="h-6 w-32 bg-muted/60 animate-pulse" />
              <Skeleton className="h-4 w-48 bg-muted/60 animate-pulse mt-1.5" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="hidden lg:block space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-center py-3 border-b border-border last:border-none">
                    <Skeleton className="h-4 w-12 bg-muted/60 animate-pulse" />
                    <Skeleton className="h-4 flex-1 bg-muted/60 animate-pulse" />
                    <Skeleton className="h-4 w-32 bg-muted/60 animate-pulse" />
                    <Skeleton className="h-4 w-20 bg-muted/60 animate-pulse" />
                    <Skeleton className="h-4 w-24 bg-muted/60 animate-pulse" />
                    <Skeleton className="h-4 w-24 bg-muted/60 animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="block lg:hidden space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border border-border rounded-lg space-y-2">
                    <Skeleton className="h-4 w-1/3 bg-muted/60 animate-pulse" />
                    <Skeleton className="h-3 w-1/2 bg-muted/60 animate-pulse" />
                    <Skeleton className="h-3 w-1/4 bg-muted/60 animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-border">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">All Users</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {totalUsersCount} users found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="block lg:hidden space-y-3">
              {paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleRowClick(user.id)}
                  className="p-3 sm:p-4 rounded-lg border border-border bg-card cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {user.name}
                          </p>
                          {isNewUser(user.createdAt) && !user.isViewedByAdmin && (
                            <Badge className="bg-green-500/20 text-green-700 border-green-200 text-[10px] whitespace-nowrap">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className="bg-secondary/10 text-secondary border-secondary/20 text-[10px] sm:text-xs"
                      variant="outline"
                    >
                      {user.role}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-foreground font-medium">
                        {statusLabels[user.status] || user.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Login:</span>
                      <span className="text-foreground">
                        {formatDate(user.lastLoginAt)}
                      </span>
                    </div>
                    {(user.role === "GUIDE" || user.role === "DRIVER") && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Verification:
                          </span>
                          <span className="text-foreground">
                            {getVerificationBadge(
                              user.verificationStatus || "NOT_APPLIED",
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Available:
                          </span>
                          <span className="text-foreground">
                            {user.isAvailable !== undefined
                              ? user.isAvailable
                                ? "Yes"
                                : "No"
                              : "-"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-2 mt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-8 px-3 text-xs w-full"
                        >
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {user.status !== "ACTIVE" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleUserAction("activate", user.id)
                            }
                          >
                            Activate
                          </DropdownMenuItem>
                        )}
                        {(user.role === "GUIDE" || user.role === "DRIVER") &&
                          user.verificationStatus !== "VERIFIED" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUserAction("verify", user.id)
                              }
                            >
                              Verify{" "}
                              {user.role === "GUIDE" ? "Guide" : "Driver"}
                            </DropdownMenuItem>
                          )}
                        {user.status !== "BLOCKED" && (
                          <DropdownMenuItem
                            onClick={() => handleUserAction("block", user.id)}
                          >
                            Block
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleUserAction("delete", user.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">
                      Profile
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">
                      Name
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">
                      Email
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">
                      Role
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">
                      Verification
                    </th>
                    {/* <th className="text-left text-xs font-medium text-muted-foreground py-3">
                      Available
                    </th> */}
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">
                      Last Login
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={(e) => {
                        if (
                          (e.target as HTMLElement).closest("button") ||
                          (e.target as HTMLElement).closest(
                            "[role='dialog']",
                          ) ||
                          (e.target as HTMLElement).closest(
                            "[role='alertdialog']",
                          ) ||
                          (e.target as HTMLElement).closest("select")
                        )
                          return;
                        handleRowClick(user.id);
                      }}
                    >
                      <td
                        className="py-3 text-sm font-medium text-foreground"
                        title={
                          user.isProfileComplete
                            ? "Profile complete"
                            : `Profile Not Complete`
                        }
                      >
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            {user.isProfileComplete ? "Yes" : "No"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          {user.name}
                          {isNewUser(user.createdAt) && !user.isViewedByAdmin && (
                            <Badge className="bg-green-500/20 text-green-700 border-green-200 text-[10px] whitespace-nowrap">
                              New
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {user.email.slice(0, 12)}...
                      </td>
                      <td className="py-3 text-sm text-foreground">
                        {user.role}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {statusLabels[user.status] || user.status}
                      </td>
                      <td className="py-3 text-sm text-foreground">
                        {user.role === "GUIDE" || user.role === "DRIVER"
                          ? getVerificationBadge(
                            user.verificationStatus || "NOT_APPLIED",
                          )
                          : "-"}
                      </td>
                      <td className="py-3 text-sm text-foreground">
                        {formatDate(user.lastLoginAt)}
                      </td>
                      <td
                        className="py-3 space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {user.status !== "ACTIVE" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="h-8 px-2 text-[10px]"
                                disabled={actionLoading === user.id}
                              >
                                Activate
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent
                              onClick={(e) => e.stopPropagation()}
                            >
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Activate User
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to activate this user?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleUserAction("activate", user.id)
                                  }
                                >
                                  Activate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {(user.role === "GUIDE" || user.role === "DRIVER") &&
                          user.verificationStatus !== "VERIFIED" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="h-8 px-2 text-[10px]"
                                  disabled={
                                    actionLoading === user.id ||
                                    user.status === "BLOCKED" ||
                                    user.status === "SUSPENDED"
                                  }
                                >
                                  Verify
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent
                                onClick={(e) => e.stopPropagation()}
                              >
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Verify{" "}
                                    {user.role === "GUIDE" ? "Guide" : "Driver"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to verify this{" "}
                                    {user.role === "GUIDE" ? "guide" : "driver"}
                                    ?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleUserAction("verify", user.id)
                                    }
                                  >
                                    Verify
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        {user.status !== "BLOCKED" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="h-8 px-2 text-[10px]"
                                disabled={actionLoading === user.id}
                              >
                                Block
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent
                              onClick={(e) => e.stopPropagation()}
                            >
                              <AlertDialogHeader>
                                <AlertDialogTitle>Block User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Blocking will prevent the user from logging
                                  in. Continue?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleUserAction("block", user.id)
                                  }
                                >
                                  Block
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {user.status !== "SUSPENDED" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="h-8 px-2 text-[10px]"
                                disabled={actionLoading === user.id}
                              >
                                Suspend
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent
                              onClick={(e) => e.stopPropagation()}
                            >
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Suspend User
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Suspending will restrict account actions.
                                  Select a duration:
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="py-4">
                                <select
                                  id={`suspend-duration-desktop-${user.id}`}
                                  className="w-full p-2 border border-border rounded bg-background text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="indefinite">
                                    Until manually changed
                                  </option>
                                  <option value="2_days">2 Days</option>
                                  <option value="1_week">1 Week</option>
                                </select>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    const select = document.getElementById(
                                      `suspend-duration-desktop-${user.id}`,
                                    ) as HTMLSelectElement;
                                    handleUserAction(
                                      "suspend",
                                      user.id,
                                      select?.value === "indefinite"
                                        ? undefined
                                        : select?.value,
                                    );
                                  }}
                                >
                                  Suspend
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-8 px-2 text-[10px]"
                              disabled={actionLoading === user.id}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            onClick={(e) => e.stopPropagation()}
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will permanently delete the user.
                                Continue?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleUserAction("delete", user.id)
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/40 px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * 20, totalUsersCount)}
                      </span>{" "}
                      of <span className="font-medium">{totalUsersCount}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs gap-1" aria-label="Pagination">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-l-md"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center px-4 text-sm font-medium text-foreground">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-r-md"
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {" "}
          <DialogHeader>
            <DialogHeader>
              <DialogTitle>
                {selectedUserDetails?.role === "GUIDE"
                  ? "Guide Profile"
                  : selectedUserDetails?.role === "DRIVER"
                    ? "Driver Profile"
                    : "User Profile"}
              </DialogTitle>

              <DialogDescription>Detailed view of the user.</DialogDescription>
            </DialogHeader>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {profileLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : selectedUserDetails ? (
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-4">
                  {selectedUserDetails.avatar ||
                    providerDetails?.driverPhoto ? (
                    <img
                      src={
                        selectedUserDetails.avatar ||
                        providerDetails?.driverPhoto
                      }
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl text-primary font-bold">
                      {selectedUserDetails.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedUserDetails.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedUserDetails.email}
                    </p>
                    <Badge className="mt-1">{selectedUserDetails.role}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Phone</p>
                    <p className="font-medium">
                      {selectedUserDetails.phone || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="font-medium">{selectedUserDetails.status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Total Bookings
                    </p>
                    <p className="font-medium">
                      {selectedUserDetails.bookingCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Total Paid</p>
                    <p className="font-medium">
                      ₹
                      {selectedUserDetails.paymentSummary?.totalPaid?.toLocaleString(
                        "en-IN",
                      ) || 0}
                    </p>
                  </div>
                  {selectedUserDetails.role === "GUIDE" && (
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Verification
                      </p>
                      <p className="font-medium mt-1">
                        {getVerificationBadge(
                          selectedUserDetails.guideVerificationStatus ||
                          "NOT_APPLIED",
                        )}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-muted-foreground text-xs">
                      Registered At
                    </p>
                    <p className="font-medium">
                      {formatDate(selectedUserDetails.createdAt)}
                    </p>
                  </div>
                </div>
                {selectedUserDetails.bio && (
                  <div className="border-t pt-4">
                    <p className="text-muted-foreground text-xs">Bio</p>
                    <p className="font-medium mt-1">
                      {selectedUserDetails.bio}
                    </p>
                  </div>
                )}

                {selectedUserDetails.providerDetails && (
                  <div className="space-y-6 pt-4 border-t border-border mt-4">
                    <h4 className="font-semibold text-base text-foreground">
                      {selectedUserDetails.role === "GUIDE"
                        ? "Guide Details"
                        : "Driver Details"}
                    </h4>

                    {selectedUserDetails.role === "GUIDE" && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <DetailItem
                          label="Price"
                          value={
                            providerDetails?.price
                              ? `₹${providerDetails.price}`
                              : "N/A"
                          }
                        />

                        <DetailItem
                          label="Duration"
                          value={providerDetails?.duration || "N/A"}
                        />

                        <DetailItem
                          label="Years Of Experience"
                          value={providerDetails?.yearsOfExperience || 0}
                        />

                        <DetailItem
                          label="Average Rating"
                          value={providerDetails?.averageRating || 0}
                        />

                        <DetailItem
                          label="Total Reviews"
                          value={providerDetails?.totalReviews || 0}
                        />

                        <DetailItem
                          label="Availability"
                          value={
                            providerDetails?.isAvailable
                              ? "Available"
                              : "Offline"
                          }
                        />

                        <div className="sm:col-span-2">
                          <BadgeList
                            label="Languages"
                            items={providerDetails?.languages}
                            variant="secondary"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <BadgeList
                            label="Specialities"
                            items={providerDetails?.specialities}
                            variant="outline"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <BadgeList
                            label="Locations"
                            items={providerDetails?.locations}
                            variant="secondary"
                          />
                        </div>

                        {providerDetails?.certificates?.length > 0 && (
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground text-xs mb-2">
                              Certificates
                            </p>
                            <div className="flex flex-col gap-2">
                              {providerDetails.certificates.map(
                                (cert: any, index: number) => (
                                  <a
                                    key={index}
                                    href={cert.image || cert.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between rounded-lg border bg-muted p-3 hover:bg-muted/80 transition"
                                  >
                                    <div>
                                      <p className="font-medium text-sm">
                                        {cert.name || "Certificate"}
                                      </p>
                                      {cert.issuer && (
                                        <p className="text-xs text-muted-foreground">
                                          Issued by {cert.issuer}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-xs text-primary font-medium">
                                      Open
                                    </div>
                                  </a>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {/* Review QR Management Section */}
                        <div className="sm:col-span-2 border-t pt-4 mt-2 space-y-4">
                          <h5 className="font-semibold text-sm text-foreground flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-primary" />
                            Guide Review QR Management
                          </h5>

                          <div className="p-4 rounded-xl border border-border bg-slate-50/50 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Review Collection</Label>
                                <p className="text-xs text-muted-foreground">
                                  Enable or disable this guide's ability to collect reviews via QR.
                                </p>
                              </div>
                              <Switch
                                checked={providerDetails?.reviewCollectionEnabled ?? true}
                                disabled={togglingCollection}
                                onCheckedChange={() => handleToggleCollection(providerDetails._id)}
                              />
                            </div>

                            {providerDetails?.reviewQRToken ? (
                              <div className="flex flex-col items-center justify-center space-y-3 pt-2">
                                <div className="p-3 bg-white rounded-xl border border-border shadow-xs">
                                  <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                      `${process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin.replace(":3001", ":3000") : "")}/review/${providerDetails.reviewQRToken}`
                                    )}`}
                                    alt="Review QR Code"
                                    className="w-[150px] h-[150px]"
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground text-center break-all max-w-[280px]">
                                  {`${process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin.replace(":3001", ":3000") : "")}/review/${providerDetails.reviewQRToken}`}
                                </p>
                                <div className="flex gap-2 w-full">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs"
                                    onClick={() => {
                                      const url = `${process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin.replace(":3001", ":3000") : "")}/review/${providerDetails.reviewQRToken}`;
                                      navigator.clipboard.writeText(url);
                                      window.alert("Review link copied to clipboard!");
                                    }}
                                  >
                                    Copy Link
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs text-destructive hover:bg-destructive/10"
                                    disabled={regeneratingQR}
                                    onClick={() => handleRegenerateQR(providerDetails._id)}
                                  >
                                    {regeneratingQR ? "Regenerating..." : "Regenerate QR"}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-xs text-muted-foreground py-2">
                                No review token assigned to this guide.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedUserDetails.role === "DRIVER" && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <DetailItem
                          label="Vehicle"
                          value={[
                            providerDetails?.vehicleType,
                            providerDetails?.vehicleName,
                          ]
                            .filter(Boolean)
                            .join(" - ")}
                        />

                        <DetailItem
                          label="Vehicle Number"
                          value={providerDetails?.vehicleNumber}
                        />

                        <DetailItem
                          label="Seats"
                          value={providerDetails?.seats}
                        />

                        <DetailItem
                          label="Availability"
                          value={
                            providerDetails?.isAvailable
                              ? "Available"
                              : "Offline"
                          }
                        />

                        <DetailItem
                          label="Average Rating"
                          value={providerDetails?.averageRating || 0}
                        />

                        <DetailItem
                          label="Total Rides"
                          value={providerDetails?.totalRides || 0}
                        />

                        <div className="sm:col-span-2">
                          <BadgeList
                            label="Languages"
                            items={providerDetails?.languages}
                            variant="secondary"
                          />
                        </div>

                        {driverLicenseImages?.length > 0 && (
                          <div className="sm:col-span-2 space-y-2">
                            <DetailItem
                              label="License Name"
                              value={providerDetails?.driverLicenseName}
                            />
                            <div className="flex flex-col gap-2">
                              {driverLicenseImages.map(
                                (image: string, idx: number) => (
                                  <a
                                    key={idx}
                                    href={image}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between rounded-lg border bg-muted p-3 hover:bg-muted/80 transition"
                                  >
                                    <span className="font-medium text-primary text-sm">
                                      View License {idx + 1}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      Open
                                    </span>
                                  </a>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {providerDetails?.vehiclePhoto && (
                          <div className="sm:col-span-2 space-y-2">
                            <p className="text-muted-foreground text-xs">
                              Vehicle Photo
                            </p>
                            <img
                              src={providerDetails.vehiclePhoto}
                              alt="Vehicle"
                              className="w-full max-w-xs rounded-xl border object-cover"
                            />
                          </div>
                        )}

                        {providerDetails?.currentLocation?.lat != null &&
                          providerDetails?.currentLocation?.lng != null && (
                            <>
                              <DetailItem
                                label="Current Latitude"
                                value={providerDetails.currentLocation.lat}
                              />
                              <DetailItem
                                label="Current Longitude"
                                value={providerDetails.currentLocation.lng}
                              />
                            </>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Failed to load details.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
