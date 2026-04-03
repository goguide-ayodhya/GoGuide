import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/auth";

const router = Router();

// All routes → only ADMIN access
router.use(authenticate, authorize(["ADMIN"]));

// Get all users
router.get("/users", adminController.getUsers);

// Block user
router.patch("/users/:id/block", adminController.blockUser);

// Activate user
router.patch("/users/:id/activate", adminController.activateUser);

// Suspend user
router.patch("/users/:id/suspend", adminController.suspendUser);

// Delete (soft delete)
router.delete("/users/:id", adminController.deleteUser);

export default router;
