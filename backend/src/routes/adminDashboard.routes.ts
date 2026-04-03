import { Router } from "express";
import { dashboardController } from "../controllers/adminDashboard.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// ADMIN
router.get("/admin", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  dashboardController.getAdminDashboard(req, res).catch(next);
});

// GUIDE
router.get("/guide", authenticate, (req, res, next) => {
  dashboardController.getGuideDashboard(req, res).catch(next);
});

// USER
router.get("/user", authenticate, (req, res, next) => {
  dashboardController.getUserDashboard(req, res).catch(next);
});

export default router;
