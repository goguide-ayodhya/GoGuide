import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { AdminMessage } from "../models/AdminMessage";
import { Notification } from "../models/Notification";
import { User } from "../models/User";

// ─── Admin: Create message ────────────────────────────────────────────────────
export async function createMessage(req: AuthRequest, res: Response) {
  try {
    const { title, description, priority } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const message = await AdminMessage.create({
      title,
      description,
      priority: priority || "normal",
      isActive: true,
      createdBy: req.userId,
    });

    // Fan out to all active guides as notifications
    const guideUsers = await User.find({ role: "GUIDE", status: "ACTIVE", isDeleted: false });
    if (guideUsers.length > 0) {
      const notifications = guideUsers.map((u) => ({
        userId: u._id,
        title,
        description,
        type: "ADMIN_MESSAGE",
        data: { messageId: message._id, priority: message.priority },
        read: false,
      }));
      await Notification.insertMany(notifications);
    }

    return res.status(201).json({ success: true, message: "Message sent", data: message });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Admin: List all messages ─────────────────────────────────────────────────
export async function listMessages(req: AuthRequest, res: Response) {
  try {
    const messages = await AdminMessage.find().sort({ createdAt: -1 }).populate("createdBy", "name email");
    return res.status(200).json({ success: true, data: messages });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Admin: Update message ────────────────────────────────────────────────────
export async function updateMessage(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, priority, isActive } = req.body;
    const message = await AdminMessage.findByIdAndUpdate(
      id,
      { title, description, priority, isActive },
      { new: true }
    );
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    return res.status(200).json({ success: true, data: message });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Admin: Delete message ────────────────────────────────────────────────────
export async function deleteMessage(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await AdminMessage.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Message deleted" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Guide: Get active messages (via their notifications with type=ADMIN_MESSAGE)
// This reuses the existing notification API so guides just call /notifications with type filter
// This endpoint provides the canonical message list for the admin message center popup
export async function getActiveMessages(req: Request, res: Response) {
  try {
    const messages = await AdminMessage.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: messages });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
