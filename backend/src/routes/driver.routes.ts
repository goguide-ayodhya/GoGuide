import { Router } from "express";
import { driverController } from "../controllers/driver.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/", (req, res, next) => {
  driverController.getAll(req, res).catch(next);
});

router.get("/:id", (req, res, next) => {
  driverController.getById(req, res).catch(next);
});

// Protected routes
router.get("/me/profile", authenticate, (req, res, next) => {
  driverController.getMyProfile(req, res).catch(next);
});

router.put("/me/profile", authenticate, (req, res, next) => {
  driverController.updateProfile(req, res).catch(next);
});

router.patch("/me/availability", authenticate, (req, res, next) => {
  driverController.toggleAvailability(req, res).catch(next);
});

export default router;