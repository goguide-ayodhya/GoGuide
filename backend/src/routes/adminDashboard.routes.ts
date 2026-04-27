import { Router } from "express";
import { dashboardController } from "../controllers/adminDashboard.controller";
import { authenticate, authorize } from "../middleware/auth";
import type { Request as ExpressRequest, Response } from "express";


const router = Router();

// PUBLIC STATS (no authentication required)
router.get("/public/stats", (req, res, next) => dashboardController.getPublicStats(req as any, res).catch(next));

// ADMIN
router.get("/admin", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  dashboardController.getAdminDashboard(req, res).catch(next);
});

router.get("/admin/recent-users", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  dashboardController.getRecentUsers(req, res).catch(next);
});

router.get("/admin/recent-guides", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  dashboardController.getRecentGuides(req, res).catch(next);
});

router.get("/admin/recent-alerts", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  dashboardController.getRecentAlerts(req, res).catch(next);
});

router.get("/admin/pending-guides", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  dashboardController.getPendingGuides(req, res).catch(next);
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
