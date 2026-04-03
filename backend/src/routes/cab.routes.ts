import { Router } from "express";
import { cabController } from "../controllers/cab.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, (req, res, next) => {
  cabController.createCab(req, res).catch(next);
});

router.get("/my-cabs", authenticate, (req, res, next) => {
  cabController.getMyCabs(req, res).catch(next);
});

router.patch("/:cabId/cancel", authenticate, (req, res, next) => {
  cabController.cancelCab(req, res).catch(next);
});

export default router;