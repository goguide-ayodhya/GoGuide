import { Router } from "express";
import { tourPackageController } from "../controllers/tourPackage.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// ADMIN
router.post("/", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  tourPackageController.createPackage(req, res).catch(next);
});

// PUBLIC
router.get("/", (req, res, next) => {
  tourPackageController.getAllPackages(req, res).catch(next);
});

router.get("/:packageId", (req, res, next) => {
  tourPackageController.getPackageById(req, res).catch(next);
});

// UPDATE
router.put(
  "/:packageId",
  authenticate,
  authorize(["ADMIN"]),
  (req, res, next) => {
    tourPackageController.updatePackage(req, res).catch(next);
  },
);

// DELETE
router.delete(
  "/:packageId",
  authenticate,
  authorize(["ADMIN"]),
  (req, res, next) => {
    tourPackageController.deletePackage(req, res).catch(next);
  },
);

export default router;
