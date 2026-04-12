
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { getUsersApi, blockUserApi, activateUserApi, suspendUserApi, deleteUserApi } from "@/lib/api/admin"

type AdminRole = "GUIDE" | "DRIVER" | "TOURIST" | "ADMIN"

type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminRole
  status: string
  phone?: string
  lastLoginAt?: string
}

const roleOptions: Array<{ key: "all" | AdminRole; label: string }> = [
  { key: "all", label: "All Users" },
  { key: "GUIDE", label: "Guides" },
  { key: "DRIVER", label: "Drivers" },
  { key: "TOURIST", label: "Tourists" },
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

  const fetchUsers = async (role: "all" | AdminRole) => {
    setLoading(true)
    setError(null)
    setActionError(null)

    try {
      const response = await getUsersApi(role === "all" ? undefined : role)
      const apiUsers = Array.isArray(response) ? response : response?.data || []

      const normalizedUsers = apiUsers.map((user: any) => ({
        id: user._id || user.id || "-",
        name: user.name || "Unknown",
        email: user.email || "-",
        role: user.role || "TOURIST",
        status: user.status || "INACTIVE",
        phone: user.phone || undefined,
        lastLoginAt: user.lastLoginAt || undefined,
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
    fetchUsers(roleFilter)
  }, [roleFilter])

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return true
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
  })

  const handleUserAction = async (
    action: "activate" | "block" | "suspend" | "delete",
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
        case "delete":
          result = await deleteUserApi(userId)
          break
      }

      if (result?.success === false) {
        throw new Error(result.message || "Action failed")
      }

      await fetchUsers(roleFilter)
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
            <CardDescription className="text-xs sm:text-sm">{filteredUsers.length} users found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="block lg:hidden space-y-3">
              {filteredUsers.map((user) => (
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
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-border">
                    {getStatusBadge(user.status)}
                    {user.status !== "ACTIVE" && (
                      <Button
                        variant="outline"
                        className="h-9 py-0 px-2 text-[10px]"
                        onClick={() => handleUserAction("activate", user.id)}
                        disabled={actionLoading === user.id}
                      >
                        Activate
                      </Button>
                    )}
                    {user.status !== "BLOCKED" && (
                      <Button
                        variant="outline"
                        className="h-9 py-0 px-2 text-[10px]"
                        onClick={() => handleUserAction("block", user.id)}
                        disabled={actionLoading === user.id}
                      >
                        Block
                      </Button>
                    )}
                    {user.status !== "SUSPENDED" && (
                      <Button
                        variant="outline"
                        className="h-9 py-0 px-2 text-[10px]"
                        onClick={() => handleUserAction("suspend", user.id)}
                        disabled={actionLoading === user.id}
                      >
                        Suspend
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="h-9 py-0 px-2 text-[10px]"
                      onClick={() => handleUserAction("delete", user.id)}
                      disabled={actionLoading === user.id}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">User ID</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Name</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Email</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Role</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Last Login</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0">
                      <td className="py-3 text-sm font-medium text-foreground">{user.id}</td>
                      <td className="py-3 text-sm text-foreground">{user.name}</td>
                      <td className="py-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="py-3 text-sm text-foreground">{user.role}</td>
                      <td className="py-3 text-sm text-muted-foreground">{statusLabels[user.status] || user.status}</td>
                      <td className="py-3 text-sm text-foreground">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-"}</td>
                      <td className="py-3 space-x-1">
                        {user.status !== "ACTIVE" && (
                          <Button
                            variant="outline"
                            className="h-8 px-2 text-[10px]"
                            onClick={() => handleUserAction("activate", user.id)}
                            disabled={actionLoading === user.id}
                          >
                            Activate
                          </Button>
                        )}
                        {user.status !== "BLOCKED" && (
                          <Button
                            variant="outline"
                            className="h-8 px-2 text-[10px]"
                            onClick={() => handleUserAction("block", user.id)}
                            disabled={actionLoading === user.id}
                          >
                            Block
                          </Button>
                        )}
                        {user.status !== "SUSPENDED" && (
                          <Button
                            variant="outline"
                            className="h-8 px-2 text-[10px]"
                            onClick={() => handleUserAction("suspend", user.id)}
                            disabled={actionLoading === user.id}
                          >
                            Suspend
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="h-8 px-2 text-[10px]"
                          onClick={() => handleUserAction("delete", user.id)}
                          disabled={actionLoading === user.id}
                        >
                          Delete
                        </Button>
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
