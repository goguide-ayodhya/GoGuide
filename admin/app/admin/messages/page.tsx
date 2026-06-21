"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Megaphone,
  Bell,
  CheckCircle,
  Eye,
} from "lucide-react";
import {
  listMessagesApi,
  createMessageApi,
  updateMessageApi,
  deleteMessageApi,
  type AdminMessage,
} from "@/lib/api/messages";

export default function MessagesPage() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"normal" | "important">("normal");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMessagesApi();
      setMessages(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load admin messages");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setTitle("");
    setDescription("");
    setPriority("normal");
    setIsActive(true);
    setIsEditing(false);
    setSelectedId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (msg: AdminMessage) => {
    setTitle(msg.title);
    setDescription(msg.description);
    setPriority(msg.priority);
    setIsActive(msg.isActive);
    setIsEditing(true);
    setSelectedId(msg._id || null);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      window.alert("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const payload: AdminMessage = {
        title: title.trim(),
        description: description.trim(),
        priority,
        isActive,
      };

      if (isEditing && selectedId) {
        await updateMessageApi(selectedId, payload);
      } else {
        await createMessageApi(payload);
      }
      setIsOpen(false);
      await fetchMessages();
    } catch (err: any) {
      window.alert(err.message || "Failed to save message");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message? Guides will no longer be able to see it.")) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteMessageApi(id);
      await fetchMessages();
    } catch (err: any) {
      window.alert(err.message || "Failed to delete message");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary animate-pulse" />
            Message Center
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Broadcast messages and announcements directly to all active guide dashboards.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto gap-2">
          <Plus className="w-4 h-4" />
          Broadcast Message
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Error Loading Messages</p>
            <p className="text-xs mt-1">{error}</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={fetchMessages}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Message List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Announcements</CardTitle>
          <CardDescription>
            All messages broadcasted to the platform guides.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              Loading broadcast messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl mx-6 mb-6">
              <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground">No broadcast messages yet</p>
              <p className="text-sm mt-1 max-w-sm mx-auto">
                Create announcements to communicate important news or updates to your guide network.
              </p>
              <Button onClick={handleOpenCreate} variant="outline" className="mt-4 gap-2">
                <Plus className="w-4 h-4" /> Create First Message
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto border-t border-border sm:border sm:rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="p-4 text-left font-semibold">Details</th>
                    <th className="p-4 text-left font-semibold">Priority</th>
                    <th className="p-4 text-left font-semibold">Status</th>
                    <th className="p-4 text-left font-semibold">Sent Date</th>
                    <th className="p-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr
                      key={msg._id}
                      className="border-b border-border/60 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4 max-w-md">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground line-clamp-1">
                            {msg.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {msg.description}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        {msg.priority === "important" ? (
                          <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white font-semibold">
                            Important
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-semibold bg-sky-100 text-sky-800 border-sky-200">
                            Normal
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        {msg.isActive ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 font-semibold">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 font-semibold">
                            Draft / Disabled
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs font-medium">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenEdit(msg)}
                            className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                            title="Edit message"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(msg._id!)}
                            disabled={deletingId === msg._id}
                            className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                            title="Delete message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                {isEditing ? "Edit Broadcast Message" : "Create Broadcast Message"}
              </DialogTitle>
              <DialogDescription>
                Announce updates, guidelines, or tasks. This message fans out to all active guides immediately.
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-[1.3fr_0.9fr] gap-6 py-6">
              {/* Form Side */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="required">Message Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter short, punchy title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="required">Content Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Write detailed announcements for guides..."
                    className="min-h-[140px] resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority level</Label>
                    <Select
                      value={priority}
                      onValueChange={(val: any) => setPriority(val)}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="important">Important</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between border border-border rounded-lg p-3 bg-muted/20">
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive-toggle" className="text-xs">Publish Active</Label>
                      <p className="text-[10px] text-muted-foreground">Visible to guides</p>
                    </div>
                    <Switch
                      id="isActive-toggle"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>
                </div>
              </div>

              {/* Guide View Preview Side */}
              <div className="flex flex-col border border-border bg-slate-50/50 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5" /> Guide App Preview
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="bg-white rounded-xl shadow-md border border-border p-4 max-w-sm w-full mx-auto space-y-3 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
                    {/* Simulator Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Admin announcement</p>
                          <p className="text-[9px] text-muted-foreground">Just now</p>
                        </div>
                      </div>
                      <Badge
                        variant={priority === "important" ? "destructive" : "secondary"}
                        className="text-[9px] px-1.5 py-0 rounded font-semibold shrink-0"
                      >
                        {priority === "important" ? "Important" : "Normal"}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 break-words line-clamp-1">
                        {title.trim() || "Example Message Title"}
                      </h4>
                      <p className="text-xs text-slate-600 break-words whitespace-pre-wrap line-clamp-3">
                        {description.trim() || "Type message contents to preview what guides will read on their dashboards."}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                      <span>GoGuide Platform</span>
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" /> Broadcasted
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Save Broadcast" : "Send Broadcast"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
