"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, CheckCircle, XCircle, Ban, Unlock, Star } from "lucide-react"
import { mockGuides, type Guide } from "@/lib/mock-data"

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>(mockGuides)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [assignedId, setAssignedId] = useState("")

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || guide.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleApprove = () => {
    if (selectedGuide && assignedId) {
      setGuides(prev => prev.map(g => 
        g.email === selectedGuide.email 
          ? { ...g, id: assignedId, status: 'approved' as const }
          : g
      ))
      setApproveDialogOpen(false)
      setSelectedGuide(null)
      setAssignedId("")
    }
  }

  const handleReject = (guide: Guide) => {
    setGuides(prev => prev.filter(g => g.email !== guide.email))
  }

  const handleBlock = (guide: Guide) => {
    setGuides(prev => prev.map(g => 
      g.id === guide.id ? { ...g, status: 'blocked' as const } : g
    ))
  }

  const handleUnblock = (guide: Guide) => {
    setGuides(prev => prev.map(g => 
      g.id === guide.id ? { ...g, status: 'approved' as const } : g
    ))
  }

  const getAvailabilityBadge = (availability: string) => {
    if (availability === 'available') {
      return <Badge className="bg-success/10 text-success border-success/20 text-[10px] sm:text-xs" variant="outline">Available</Badge>
    }
    return <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[10px] sm:text-xs" variant="outline">Unavailable</Badge>
  }

  const getPresenceBadge = (presence: string) => {
    if (presence === 'online') {
      return <Badge className="bg-success/10 text-success border-success/20 text-[10px] sm:text-xs" variant="outline">Online</Badge>
    }
    return <Badge className="bg-muted text-muted-foreground border-border text-[10px] sm:text-xs" variant="outline">Offline</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/10 text-success border-success/20 text-[10px] sm:text-xs" variant="outline">Approved</Badge>
      case 'pending':
        return <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[10px] sm:text-xs" variant="outline">Pending</Badge>
      case 'blocked':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] sm:text-xs" variant="outline">Blocked</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Guide Management</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Manage and monitor tour guides on the platform.</p>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                className="h-10 text-xs sm:text-sm flex-1 sm:flex-none min-w-[70px]"
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "approved" ? "default" : "outline"}
                className="h-10 text-xs sm:text-sm flex-1 sm:flex-none min-w-[70px]"
                onClick={() => setFilterStatus("approved")}
              >
                Approved
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                className="h-10 text-xs sm:text-sm flex-1 sm:flex-none min-w-[70px]"
                onClick={() => setFilterStatus("pending")}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === "blocked" ? "default" : "outline"}
                className="h-10 text-xs sm:text-sm flex-1 sm:flex-none min-w-[70px]"
                onClick={() => setFilterStatus("blocked")}
              >
                Blocked
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guides - Mobile Cards / Desktop Table */}
      <Card className="border-border">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">All Guides</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{filteredGuides.length} guides found</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile View - Cards */}
          <div className="block lg:hidden space-y-3">
            {filteredGuides.map((guide) => (
              <div key={guide.email} className="p-3 sm:p-4 rounded-lg border border-border bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {guide.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{guide.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{guide.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {guide.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => {
                            setSelectedGuide(guide)
                            setApproveDialogOpen(true)
                          }}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleReject(guide)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {guide.status === 'approved' && (
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleBlock(guide)}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Block
                        </DropdownMenuItem>
                      )}
                      {guide.status === 'blocked' && (
                        <DropdownMenuItem onClick={() => handleUnblock(guide)}>
                          <Unlock className="w-4 h-4 mr-2" />
                          Unblock
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-2 text-xs">
                  {guide.id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="text-foreground font-medium">{guide.id}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Rating:</span>
                    {guide.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                        <span className="font-medium">{guide.rating}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bookings:</span>
                    <span className="text-foreground">{guide.totalBookings}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {guide.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-[10px]">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-border">
                  {getStatusBadge(guide.status)}
                  {getAvailabilityBadge(guide.availability)}
                  {getPresenceBadge(guide.presence)}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden lg:block overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Guide ID</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Languages</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Rating</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Availability</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Presence</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Bookings</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuides.map((guide) => (
                  <tr key={guide.email} className="border-b border-border last:border-0">
                    <td className="py-3 text-sm font-medium text-foreground">
                      {guide.id || "-"}
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{guide.name}</p>
                        <p className="text-xs text-muted-foreground">{guide.email}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {guide.languages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      {guide.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-warning text-warning" />
                          <span className="text-sm font-medium">{guide.rating}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3">{getAvailabilityBadge(guide.availability)}</td>
                    <td className="py-3">{getPresenceBadge(guide.presence)}</td>
                    <td className="py-3 text-sm text-foreground">{guide.totalBookings}</td>
                    <td className="py-3">{getStatusBadge(guide.status)}</td>
                    <td className="py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {guide.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => {
                                setSelectedGuide(guide)
                                setApproveDialogOpen(true)
                              }}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleReject(guide)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {guide.status === 'approved' && (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleBlock(guide)}
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Block
                            </DropdownMenuItem>
                          )}
                          {guide.status === 'blocked' && (
                            <DropdownMenuItem onClick={() => handleUnblock(guide)}>
                              <Unlock className="w-4 h-4 mr-2" />
                              Unblock
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="mx-4 sm:mx-auto max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Approve Guide</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Assign a Guide ID to approve {selectedGuide?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 sm:py-4">
            <div className="space-y-2">
              <Label htmlFor="guideId" className="text-sm">Guide ID</Label>
              <Input
                id="guideId"
                placeholder="e.g., GD005"
                value={assignedId}
                onChange={(e) => setAssignedId(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} className="h-11">
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={!assignedId} className="h-11">
              Approve Guide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
