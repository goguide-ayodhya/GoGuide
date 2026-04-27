import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { payoutController } from "../controllers/payout.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/auth";

const router = Router();

// All routes → only ADMIN access
router.use(authenticate, authorize(["ADMIN"]));

// Get all users
router.get("/users", adminController.getUsers);

// Get user detail
router.get("/users/:id", adminController.getUserDetail);

// Block user
router.patch("/users/:id/block", adminController.blockUser);

// Activate user
router.patch("/users/:id/activate", adminController.activateUser);

// Suspend user
router.patch("/users/:id/suspend", adminController.suspendUser);

// Delete (soft delete)
router.delete("/users/:id", adminController.deleteUser);

// Guide payouts
router.post("/payout/:guideId", (req, res, next) => {
  payoutController.createByAdmin(req, res).catch(next);
});

router.get("/payouts", (req, res, next) => {
  payoutController.listAllAdmin(req, res).catch(next);
});

router.get("/guides/payout-overview", (req, res, next) => {
  payoutController.guidesOverview(req, res).catch(next);
});

export default router;
