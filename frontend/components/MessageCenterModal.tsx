"use client";

import { useEffect, useState } from "react";
import { X, Bell, AlertTriangle, CheckCheck, MessageSquare } from "lucide-react";
import {
  getActiveMessagesApi,
  getNotificationsApi,
  markAllNotificationsReadApi,
} from "@/lib/api/guide-extras";

interface Message {
  _id: string;
  title: string;
  description: string;
  priority: "normal" | "important";
  createdAt: string;
  isActive: boolean;
}

interface MessageCenterModalProps {
  onClose: () => void;
  onRead: () => void;
}

export function MessageCenterModal({ onClose, onRead }: MessageCenterModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getActiveMessagesApi();
        setMessages(Array.isArray(data) ? data : []);
        // Mark all ADMIN_MESSAGE notifications as read
        await markAllNotificationsReadApi();
        onRead();
      } catch (e) {
        console.error("Failed to load messages", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const priorityMessages = messages.filter((m) => m.priority === "important");
  const normalMessages = messages.filter((m) => m.priority === "normal");

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-end z-50 p-4 pt-16"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Message Center</h2>
            {messages.length > 0 && (
              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {messages.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No messages from admin</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {/* Important first */}
              {priorityMessages.map((msg) => (
                <div
                  key={msg._id}
                  className="rounded-xl p-3.5 bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">{msg.title}</p>
                        <span className="text-[10px] bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100 rounded-full px-1.5 py-0.5 font-medium">
                          Important
                        </span>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">{msg.description}</p>
                      <p className="text-[10px] text-amber-500 mt-1.5">
                        {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Normal messages */}
              {normalMessages.map((msg) => (
                <div
                  key={msg._id}
                  className="rounded-xl p-3.5 bg-muted/40 border border-border"
                >
                  <p className="font-medium text-sm text-foreground">{msg.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{msg.description}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                    {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && messages.length > 0 && (
          <div className="p-3 border-t border-border text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCheck className="h-3 w-3" /> All messages marked as read
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
