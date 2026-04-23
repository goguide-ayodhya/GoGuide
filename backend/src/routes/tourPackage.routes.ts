import { Router } from "express";
import { tourPackageController } from "../controllers/tourPackage.controller";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Public - list packages
router.get("/", (req, res, next) => {
  tourPackageController.getAllPackages(req, res).catch(next);
});

// Public - get single package
router.get("/:packageId", (req, res, next) => {
  tourPackageController.getPackageById(req, res).catch(next);
});

// Admin - create package (supports multipart uploads)
router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  upload.fields([{ name: "images", maxCount: 10 }]),
  (req, res, next) => {
    tourPackageController.createPackage(req, res).catch(next);
  },
);

// Admin - update package
router.put(
  "/:packageId",
  authenticate,
  authorize(["ADMIN"]),
  upload.fields([{ name: "images", maxCount: 10 }]),
  (req, res, next) => {
    tourPackageController.updatePackage(req, res).catch(next);
  },
);

// Admin - delete package
router.delete(
  "/:packageId",
  authenticate,
  authorize(["ADMIN"]),
  (req, res, next) => {
    tourPackageController.deletePackage(req, res).catch(next);
  },
);

export default router;
