
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { getUsersApi, blockUserApi, activateUserApi, suspendUserApi, deleteUserApi, verifyUserApi, unverifyUserApi } from "@/lib/api/admin"
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

export default function GuidesPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | AdminRole>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [debouncedSearch, setDebouncedSearch] = useState("")

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
      }))

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

  const filteredByStatus = filteredUsers // status is now server-side

  const handleUserAction = async (
    action: "activate" | "block" | "suspend" | "delete" | "verify" | "unverify",
    userId: string,
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
          result = await suspendUserApi(userId)
          break
        case "verify":
          result = await verifyUserApi(userId)
          break
        case "unverify":
          result = await unverifyUserApi(userId)
          break
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
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((option) => (
                <Button
                  key={option.key}
                  variant={roleFilter === option.key ? "default" : "outline"}
                  className="h-10 text-xs sm:text-sm min-w-[80px]"
                  onClick={() => setRoleFilter(option.key)}
                >
                  {option.label}
                </Button>
              ))}
              <div className="ml-2 flex flex-wrap gap-2">
                {statusOptions.map((s) => (
                  <Button
                    key={s.key}
                    variant={statusFilter === s.key ? "default" : "outline"}
                    className="h-10 text-xs sm:text-sm min-w-[100px]"
                    onClick={() => setStatusFilter(s.key)}
                  >
                    {s.label}
                  </Button>
                ))}
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
                      <span className="text-foreground">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-"}</span>
                    </div>
                    {(user.role === "GUIDE" || user.role === "DRIVER") && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Verification:</span>
                          <span className="text-foreground">{user.verificationStatus || "NOT_APPLIED"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="text-foreground">{user.isAvailable !== undefined ? (user.isAvailable ? "Yes" : "No") : "-"}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-border">
                    {getStatusBadge(user.status)}
                    {user.role === "GUIDE" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="h-9 py-0 px-2 text-[10px]" disabled={actionLoading === user.id}>
                            {user.verificationStatus === "VERIFIED" ? "Unverify" : "Verify"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{user.verificationStatus === "VERIFIED" ? "Unverify Guide" : "Verify Guide"}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {user.verificationStatus === "VERIFIED"
                                ? "This will mark the guide as unverified and deactivate guide access."
                                : "This will verify the guide profile and activate the guide account."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleUserAction(user.verificationStatus === "VERIFIED" ? "unverify" : "verify", user.id)}>
                              {user.verificationStatus === "VERIFIED" ? "Unverify" : "Verify"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {user.status !== "ACTIVE" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="h-9 py-0 px-2 text-[10px]" disabled={actionLoading === user.id}>
                            Activate
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Activate User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to activate this user?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleUserAction("activate", user.id)}>Activate</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {user.status !== "BLOCKED" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="h-9 py-0 px-2 text-[10px]" disabled={actionLoading === user.id}>
                            Block
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
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
                          <Button variant="outline" className="h-9 py-0 px-2 text-[10px]" disabled={actionLoading === user.id}>
                            Suspend
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Suspend User</AlertDialogTitle>
                            <AlertDialogDescription>Suspending will restrict account actions. Continue?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleUserAction("suspend", user.id)}>Suspend</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="h-9 py-0 px-2 text-[10px]" disabled={actionLoading === user.id}>
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
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
                    <tr key={user.id} className="border-b border-border last:border-0">
                      <td className="py-3 text-sm font-medium text-foreground">{user.id}</td>
                      <td className="py-3 text-sm text-foreground">{user.name}</td>
                      <td className="py-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="py-3 text-sm text-foreground">{user.role}</td>
                      <td className="py-3 text-sm text-muted-foreground">{statusLabels[user.status] || user.status}</td>
                      <td className="py-3 text-sm text-foreground">{(user.role === "GUIDE" || user.role === "DRIVER") ? (user.verificationStatus || "NOT_APPLIED") : "-"}</td>
                      <td className="py-3 text-sm text-foreground">{(user.role === "GUIDE" || user.role === "DRIVER") ? (user.isAvailable !== undefined ? (user.isAvailable ? "Yes" : "No") : "-") : "-"}</td>
                      <td className="py-3 text-sm text-foreground">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-"}</td>
                      <td className="py-3 space-x-1">
                        {user.status !== "ACTIVE" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="h-8 px-2 text-[10px]" disabled={actionLoading === user.id}>Activate</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
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
                        {user.role === "GUIDE" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="h-8 px-2 text-[10px]" disabled={actionLoading === user.id}>
                              {user.verificationStatus === "VERIFIED" ? "Unverify" : "Verify"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{user.verificationStatus === "VERIFIED" ? "Unverify Guide" : "Verify Guide"}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {user.verificationStatus === "VERIFIED"
                                  ? "This will mark the guide as unverified and deactivate guide access."
                                  : "This will verify the guide profile and activate the guide account."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleUserAction(user.verificationStatus === "VERIFIED" ? "unverify" : "verify", user.id)}>
                                {user.verificationStatus === "VERIFIED" ? "Unverify" : "Verify"}
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
                            <AlertDialogContent>
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
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspend User</AlertDialogTitle>
                                <AlertDialogDescription>Suspending will restrict account actions. Continue?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUserAction("suspend", user.id)}>Suspend</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="h-8 px-2 text-[10px]" disabled={actionLoading === user.id}>Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
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
    </div>
  )
}
