import { Router } from "express";
import {
  createMessage,
  listMessages,
  updateMessage,
  deleteMessage,
  getActiveMessages,
} from "../controllers/message.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Guide: get active messages (unauthenticated list for popup)
router.get("/active", authenticate, authorize(["GUIDE"]), (req, res, next) => {
  getActiveMessages(req, res).catch(next);
});

// Admin only
router.get("/", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  listMessages(req, res).catch(next);
});

router.post("/", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  createMessage(req, res).catch(next);
});

router.put("/:id", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  updateMessage(req, res).catch(next);
});

router.delete("/:id", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  deleteMessage(req, res).catch(next);
});

export default router;
