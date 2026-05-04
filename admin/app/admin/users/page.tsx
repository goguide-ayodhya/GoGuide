
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getUsersApi, blockUserApi, activateUserApi, suspendUserApi, deleteUserApi, verifyUserApi, unverifyUserApi, getUserDetailApi } from "@/lib/api/admin"
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
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AdminRole = "GUIDE" | "DRIVER" | "TOURIST" | "ADMIN"

type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminRole
  status: string
  phone?: string
  lastLoginAt?: string
  verificationStatus?: string
  isAvailable?: boolean
}

const roleOptions: Array<{ key: "all" | AdminRole; label: string }> = [
  { key: "all", label: "All Users" },
  { key: "GUIDE", label: "Guides" },
  { key: "DRIVER", label: "Drivers" },
  { key: "TOURIST", label: "Tourists" },
]

const statusOptions = [
  { key: "all", label: "All Statuses" },
  { key: "ACTIVE", label: "Active" },
  { key: "BLOCKED", label: "Blocked" },
  { key: "SUSPENDED", label: "Suspended" },
  { key: "DELETED", label: "Deleted" },
]

const verificationOptions = [
  { key: "all", label: "All Verification" },
  { key: "VERIFIED", label: "Verified" },
  { key: "UNVERIFIED", label: "Unverified" },
]

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BLOCKED: "Blocked",
  SUSPENDED: "Suspended",
  DELETED: "Deleted",
}

const getStatusBadge = (status: string) => {
  const label = statusLabels[status] || status
  const colorClass =
    status === "ACTIVE"
      ? "bg-success/10 text-success border-success/20"
      : status === "BLOCKED"
        ? "bg-destructive/10 text-destructive border-destructive/20"
        : status === "SUSPENDED"
          ? "bg-warning/10 text-warning-foreground border-warning/20"
          : "bg-muted text-muted-foreground border-border"

  return (
    <Badge className={`${colorClass} text-[10px] sm:text-xs`} variant="outline">
      {label}
    </Badge>
  )
}

const getVerificationBadge = (status: string) => {
  if (status === "VERIFIED") return <Badge className="bg-secondary text-primary-foreground border-success/20 text-[10px] sm:text-xs" variant="outline">VERIFIED</Badge>;
  if (status === "PENDING") return <Badge className="bg-warning text-warning-foreground border-warning/20 text-[10px] sm:text-xs" variant="outline">PENDING</Badge>;
  if (status === "REJECTED") return <Badge className="bg-destructive text-destructive border-destructive/20 text-[10px] sm:text-xs" variant="outline">REJECTED</Badge>;
  return <Badge className="bg-muted text-muted-foreground border-border text-[10px] sm:text-xs" variant="outline">UNVERIFIED</Badge>;
}

export default function GuidesPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | AdminRole>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [verificationFilter, setVerificationFilter] = useState<string>("all")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  const fetchUsers = async (role: "all" | AdminRole, status: string, search?: string) => {
    setLoading(true)
    setError(null)
    setActionError(null)

    try {
      const response = await getUsersApi(role, status, search)
      const apiUsers = Array.isArray(response) ? response : response?.data || []

      const normalizedUsers = apiUsers.map((user: any) => ({
        id: user._id || user.id || "-",
        name: user.name || "Unknown",
        email: user.email || "-",
        role: user.role || "TOURIST",
        status: user.status || "INACTIVE",
        phone: user.phone || undefined,
        lastLoginAt: user.lastLoginAt || undefined,
        verificationStatus: user.verificationStatus || user.guideVerificationStatus || undefined,
        isAvailable: user.isAvailable || undefined,
        createdAt: user.createdAt || new Date().toISOString(),
      }))

      normalizedUsers.sort((a: { createdAt: string | number | Date }, b: { createdAt: string | number | Date }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setUsers(normalizedUsers)
    } catch (err: any) {
      console.error("Failed to fetch users:", err)
      setError(err.message || "Unable to fetch users")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchUsers(roleFilter, statusFilter, debouncedSearch || undefined)
  }, [roleFilter, statusFilter, debouncedSearch])

  const filteredUsers = users // search is now server-side

  const filteredByStatus = filteredUsers.filter(user => {
    if (verificationFilter === "VERIFIED") return user.verificationStatus === "VERIFIED"
    if (verificationFilter === "UNVERIFIED") return user.verificationStatus !== "VERIFIED"
    return true
  })

  const handleUserAction = async (
    action: "activate" | "block" | "suspend" | "delete" | "verify" | "unverify",
    userId: string,
    duration?: string
  ) => {
    setActionLoading(userId)
    setActionError(null)

    try {
      let result: any

      switch (action) {
        case "activate":
          result = await activateUserApi(userId)
          break
        case "block":
          result = await blockUserApi(userId)
          break
        case "suspend":
          result = await suspendUserApi(userId, duration)
          break
        case "verify":
          result = await verifyUserApi(userId)
          break
        // case "unverify":
        //   result = await unverifyUserApi(userId)
        //   break
        case "delete":
          result = await deleteUserApi(userId)
          break
      }

      if (result?.success === false) {
        throw new Error(result.message || "Action failed")
      }

      await fetchUsers(roleFilter, statusFilter, debouncedSearch || undefined)
    } catch (err: any) {
      console.error(`Failed to ${action} user:`, err)
      setActionError(err.message || `Unable to ${action} user`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRowClick = async (userId: string) => {
    setIsProfileOpen(true)
    setProfileLoading(true)
    try {
      const details = await getUserDetailApi(userId)
      setSelectedUserDetails(details?.data || details)
    } catch (err) {
      console.error("Failed to load user details", err)
      setSelectedUserDetails(null)
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">User Management</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Manage platform users and filter by Guides, Drivers, or Tourists.</p>
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
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <Select value={roleFilter} onValueChange={(val: any) => setRoleFilter(val)}>
                  <SelectTrigger className="w-full h-10 bg-background">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full h-10 bg-background">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Verification</label>
                <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                  <SelectTrigger className="w-full h-10 bg-background">
                    <SelectValue placeholder="Select Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    {verificationOptions.map((v) => (
                      <SelectItem key={v.key} value={v.key}>{v.label}</SelectItem>
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
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : (
        <Card className="border-border">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">All Users</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{filteredByStatus.length} users found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="block lg:hidden space-y-3">
              {filteredByStatus.map((user) => (
                <div key={user.id} className="p-3 sm:p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-primary">{user.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-[10px] sm:text-xs" variant="outline">
                      {user.role}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-foreground font-medium">{statusLabels[user.status] || user.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Login:</span>
                      <span className="text-foreground">{formatDate(user.lastLoginAt)}</span>
                    </div>
                    {(user.role === "GUIDE" || user.role === "DRIVER") && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Verification:</span>
                          <span className="text-foreground">{getVerificationBadge(user.verificationStatus || "NOT_APPLIED")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="text-foreground">{user.isAvailable !== undefined ? (user.isAvailable ? "Yes" : "No") : "-"}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-8 px-3 text-xs w-full">Actions</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                        {user.status !== "ACTIVE" && (
                          <DropdownMenuItem onClick={() => handleUserAction("activate", user.id)}>Activate</DropdownMenuItem>
                        )}
                        {(user.role === "GUIDE" || user.role === "DRIVER") && user.verificationStatus !== "VERIFIED" && (
                          <DropdownMenuItem onClick={() => handleUserAction("verify", user.id)}>Verify {user.role === "GUIDE" ? "Guide" : "Driver"}</DropdownMenuItem>
                        )}
                        {user.status !== "BLOCKED" && (
                          <DropdownMenuItem onClick={() => handleUserAction("block", user.id)}>Block</DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleUserAction("delete", user.id)} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
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
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">User ID</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Name</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Email</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Role</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Verification</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Available</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Last Login</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredByStatus.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer" onClick={(e) => {
                      if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("[role='dialog']") || (e.target as HTMLElement).closest("[role='alertdialog']") || (e.target as HTMLElement).closest("select")) return;
                      handleRowClick(user.id);
                    }}>
                      <td className="py-3 text-sm font-medium text-foreground">{user.id}</td>
                      <td className="py-3 text-sm text-foreground">{user.name}</td>
                      <td className="py-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="py-3 text-sm text-foreground">{user.role}</td>
                      <td className="py-3 text-sm text-muted-foreground">{statusLabels[user.status] || user.status}</td>
                      <td className="py-3 text-sm text-foreground">{(user.role === "GUIDE" || user.role === "DRIVER") ? getVerificationBadge(user.verificationStatus || "NOT_APPLIED") : "-"}</td>
                      <td className="py-3 text-sm text-foreground">{(user.role === "GUIDE" || user.role === "DRIVER") ? (user.isAvailable !== undefined ? (user.isAvailable ? "Yes" : "No") : "-") : "-"}</td>
                      <td className="py-3 text-sm text-foreground">{formatDate(user.lastLoginAt)}</td>
                      <td className="py-3 space-x-1" onClick={(e) => e.stopPropagation()}>
                        {user.status !== "ACTIVE" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="h-8 px-2 text-[10px]" disabled={actionLoading === user.id}>Activate</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Activate User</AlertDialogTitle>
                                <AlertDialogDescription>Are you sure you want to activate this user?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUserAction("activate", user.id)}>Activate</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {(user.role === "GUIDE" || user.role === "DRIVER") && user.verificationStatus !== "VERIFIED" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="h-8 px-2 text-[10px]" disabled={actionLoading === user.id}>
                                Verify
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Verify {user.role === "GUIDE" ? "Guide" : "Driver"}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will verify the profile and activate the {user.role === "GUIDE" ? "guide" : "driver"} account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUserAction("verify", user.id)}>
                                  Verify
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {user.status !== "BLOCKED" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="h-8 px-2 text-[10px]" disabled={actionLoading === user.id}>Block</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Block User</AlertDialogTitle>
                                <AlertDialogDescription>Blocking will prevent the user from logging in. Continue?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUserAction("block", user.id)}>Block</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {user.status !== "SUSPENDED" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="h-8 px-2 text-[10px]" disabled={actionLoading === user.id}>Suspend</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspend User</AlertDialogTitle>
                                <AlertDialogDescription>Suspending will restrict account actions. Select a duration:</AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="py-4">
                                <select id={`suspend-duration-desktop-${user.id}`} className="w-full p-2 border border-border rounded bg-background text-sm" onClick={(e) => e.stopPropagation()}>
                                  <option value="indefinite">Until manually changed</option>
                                  <option value="2_days">2 Days</option>
                                  <option value="1_week">1 Week</option>
                                </select>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                  const select = document.getElementById(`suspend-duration-desktop-${user.id}`) as HTMLSelectElement;
                                  handleUserAction("suspend", user.id, select?.value === "indefinite" ? undefined : select?.value);
                                }}>Suspend</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="h-8 px-2 text-[10px]" disabled={actionLoading === user.id}>Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>This action will permanently delete the user. Continue?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleUserAction("delete", user.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Detailed view of the user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {profileLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : selectedUserDetails ? (
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-4">
                  {selectedUserDetails.avatar ? (
                    <img src={selectedUserDetails.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl text-primary font-bold">
                      {selectedUserDetails.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{selectedUserDetails.name}</h3>
                    <p className="text-muted-foreground">{selectedUserDetails.email}</p>
                    <Badge className="mt-1">{selectedUserDetails.role}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Phone</p>
                    <p className="font-medium">{selectedUserDetails.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="font-medium">{selectedUserDetails.status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Total Bookings</p>
                    <p className="font-medium">{selectedUserDetails.bookingCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Total Paid</p>
                    <p className="font-medium">₹{selectedUserDetails.paymentSummary?.totalPaid?.toLocaleString("en-IN") || 0}</p>
                  </div>
                  {selectedUserDetails.role === "GUIDE" && (
                    <div>
                      <p className="text-muted-foreground text-xs">Verification</p>
                      <p className="font-medium mt-1">{getVerificationBadge(selectedUserDetails.guideVerificationStatus || "NOT_APPLIED")}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground text-xs">Registered At</p>
                    <p className="font-medium">{formatDate(selectedUserDetails.createdAt)}</p>
                  </div>
                </div>
                {selectedUserDetails.bio && (
                  <div className="border-t pt-4">
                    <p className="text-muted-foreground text-xs">Bio</p>
                    <p className="font-medium mt-1">{selectedUserDetails.bio}</p>
                  </div>
                )}
                {selectedUserDetails.providerDetails && (
                  <div className="space-y-4 pt-4 border-t border-border mt-4">
                    <h4 className="font-semibold text-base text-foreground">Provider Details</h4>

                    {selectedUserDetails.providerDetails.languages && selectedUserDetails.providerDetails.languages.length > 0 && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Languages</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedUserDetails.providerDetails.languages.map((lang: string) => (
                            <Badge key={lang} variant="secondary" className="text-[10px]">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedUserDetails.providerDetails.specialities && selectedUserDetails.providerDetails.specialities.length > 0 && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Specialities</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedUserDetails.providerDetails.specialities.map((spec: string) => (
                            <Badge key={spec} variant="outline" className="text-[10px]">{spec}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedUserDetails.providerDetails.vehicleType && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Vehicle</p>
                        <p className="text-sm font-medium">{selectedUserDetails.providerDetails.vehicleType} - {selectedUserDetails.providerDetails.vehicleNumber}</p>
                      </div>
                    )}

                    {selectedUserDetails.providerDetails.certificates && selectedUserDetails.providerDetails.certificates.length > 0 && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Certificates</p>
                        <div className="flex flex-col gap-2">
                          {selectedUserDetails.providerDetails.certificates.map((cert: any, i: number) => (
                            <div key={i} className="text-sm bg-muted p-2 rounded-md flex justify-between items-center">
                              <span>
                                {(cert.image || cert.url) ? (
                                  <a href={cert.image || cert.url} target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                    {cert.name || "View Certificate"}
                                  </a>
                                ) : (
                                  cert.name || "Certificate"
                                )}
                                <span className="text-muted-foreground ml-1">
                                  {cert.issuer ? `(Issued by ${cert.issuer})` : ""}
                                </span>
                              </span>
                              {cert.year && <span className="text-xs text-muted-foreground">{cert.year}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Failed to load details.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
