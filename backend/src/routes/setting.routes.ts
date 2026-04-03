import { Router } from "express";
import { settingsController } from "../controllers/setting,controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// All routes need login
router.use(authenticate);

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