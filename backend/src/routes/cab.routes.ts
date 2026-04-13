import { Router } from "express";
import { CabController } from "../controllers/driver.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, (req, res, next) => {
  CabController.createCab(req, res).catch(next);
});

router.get("/my-cabs", authenticate, (req, res, next) => {
  CabController.getMyCabs(req, res).catch(next);
});

router.patch("/:cabId/cancel", authenticate, (req, res, next) => {
  CabController.cancelCab(req, res).catch(next);
});

export default router;