import { Router } from "express";
import { driverController } from "../controllers/driver.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { createDriverProfileSchema, updateDriverProfileSchema } from "../validations/driver";
import { upload } from "../middleware/upload";

const router = Router();

// Public routes
router.get("/", (req, res, next) => {
  driverController.getAll(req, res).catch(next);
});

router.get("/admin/all", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  driverController.getAllForAdmin(req, res).catch(next);
});

router.get("/:id", (req, res, next) => {
  driverController.getById(req, res).catch(next);
});

// Protected routes
router.post(
  "/create-profile",
  authenticate,
  upload.fields([
    { name: "driverPhoto", maxCount: 1 },
    { name: "vehiclePhoto", maxCount: 1 },
    { name: "driverLicense", maxCount: 1 },
  ]),
  validate(createDriverProfileSchema),
  (req, res, next) => {
    driverController.createProfile(req, res).catch(next);
  },
);

router.get("/me/profile", authenticate, (req, res, next) => {
  driverController.getMyProfile(req, res).catch(next);
});

router.put(
  "/me/profile",
  authenticate,
  upload.fields([
    { name: "driverPhoto", maxCount: 1 },
    { name: "vehiclePhoto", maxCount: 1 },
    { name: "driverLicense", maxCount: 5 },
  ]),
  validate(updateDriverProfileSchema),
  (req, res, next) => {
    driverController.updateProfile(req, res).catch(next);
  },
);

router.patch("/me/availability", authenticate, (req, res, next) => {
  driverController.toggleAvailability(req, res).catch(next);
});

export default router;