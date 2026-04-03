"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Search, Mail, CheckCircle, Clock, Eye, Trash2 } from "lucide-react"
import { mockMessages, type Message } from "@/lib/mock-data"

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.touristName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = 
      filterStatus === "all" || 
      (filterStatus === "resolved" && message.resolved) ||
      (filterStatus === "pending" && !message.resolved)
    return matchesSearch && matchesFilter
  })

  const handleResolve = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, resolved: true } : m
    ))
  }

  const handleDelete = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId))
  }

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message)
    setViewDialogOpen(true)
  }

  const pendingCount = messages.filter(m => !m.resolved).length
  const resolvedCount = messages.filter(m => m.resolved).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">View and respond to tourist inquiries.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Messages</p>
                <p className="text-xl font-semibold text-foreground">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-semibold text-foreground">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Resolved</p>
                <p className="text-xl font-semibold text-foreground">{resolvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                className="h-11 min-w-[44px]"
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                className="h-11 min-w-[44px]"
                onClick={() => setFilterStatus("pending")}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === "resolved" ? "default" : "outline"}
                className="h-11 min-w-[44px]"
                onClick={() => setFilterStatus("resolved")}
              >
                Resolved
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">All Messages</CardTitle>
          <CardDescription>{filteredMessages.length} messages found</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages found.
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div 
                key={message.id} 
                className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {message.touristName.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{message.touristName}</p>
                        <p className="text-xs text-muted-foreground truncate">{message.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start">
                      {message.resolved ? (
                        <Badge className="bg-success/10 text-success border-success/20" variant="outline">
                          Resolved
                        </Badge>
                      ) : (
                        <Badge className="bg-warning/10 text-warning-foreground border-warning/20" variant="outline">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="pl-0 sm:pl-13">
                    <p className="text-sm text-foreground line-clamp-2">{message.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{message.date}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    <Button 
                      variant="outline"
                      className="h-11 min-w-[44px] flex-1 sm:flex-none"
                      onClick={() => handleViewMessage(message)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Message
                    </Button>
                    
                    {!message.resolved && (
                      <Button 
                        variant="outline"
                        className="h-11 min-w-[44px] flex-1 sm:flex-none"
                        onClick={() => handleResolve(message.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Resolved
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline"
                          className="h-11 min-w-[44px] flex-1 sm:flex-none text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4 sm:mx-auto max-w-[calc(100vw-2rem)] sm:max-w-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Message</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this message from {message.touristName}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="h-11 min-w-[44px]">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(message.id)}
                            className="h-11 min-w-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="mx-4 sm:mx-auto max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              Full message from the tourist.
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-medium text-primary">
                    {selectedMessage.touristName.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{selectedMessage.touristName}</p>
                  <p className="text-sm text-muted-foreground truncate">{selectedMessage.email}</p>
                </div>
                {selectedMessage.resolved ? (
                  <Badge className="bg-success/10 text-success border-success/20 shrink-0" variant="outline">
                    Resolved
                  </Badge>
                ) : (
                  <Badge className="bg-warning/10 text-warning-foreground border-warning/20 shrink-0" variant="outline">
                    Pending
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Date</p>
                  <p className="text-sm text-foreground">{selectedMessage.date}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Message</p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
                {!selectedMessage.resolved && (
                  <Button 
                    className="h-11 min-w-[44px] flex-1"
                    onClick={() => {
                      handleResolve(selectedMessage.id)
                      setSelectedMessage({ ...selectedMessage, resolved: true })
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </Button>
                )}
                <Button 
                  variant="outline"
                  className="h-11 min-w-[44px] flex-1"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
