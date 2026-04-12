import { Router } from "express";
import { settingsController } from "../controllers/setting,controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes need login
router.use(authenticate);

// Cab pricing is admin-only
router.get("/cab-pricing", authorize(["ADMIN"]), (req, res, next) => {
  settingsController.getCabPricing(req, res).catch(next);
});

router.put("/cab-pricing", authorize(["ADMIN"]), (req, res, next) => {
  settingsController.updateCabPricing(req, res).catch(next);
});

// GET profile
router.get("/me", (req, res, next) => {
  settingsController.getProfile(req, res).catch(next);
});

// UPDATE profile
router.put("/me", (req, res, next) => {
  settingsController.updateProfile(req, res).catch(next);
});

// CHANGE password
router.post("/change-password", (req, res, next) => {
  settingsController.changePassword(req, res).catch(next);
});

export default router;