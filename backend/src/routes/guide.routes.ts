import { Router } from "express";
import { guideController } from "../controllers/guide.controller";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", (req, res, next) => {
  guideController.getAllGuides(req, res).catch(next);
});

router.get("/me", authenticate, (req, res, next) => {
  guideController.getMyGuideProfile(req, res).catch(next);
});

router.get("/:guideId", (req, res, next) => {
  guideController.getGuideById(req, res).catch(next);
});

router.put(
  "/me",
  authenticate,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "certificates", maxCount: 5 },
  ]),
  (req, res, next) => {
    guideController.updateGuideProfile(req, res).catch(next);
  },
);

router.patch("/me/availability", authenticate, (req, res, next) => {
  guideController.setAvailability(req, res).catch(next);
});

router.patch("/me/complete-profile", authenticate, (req, res, next) => {
  guideController.completeProfile(req, res).catch(next);
});

router.patch(
  "/:guideId/verify",
  authenticate,
  authorize(["ADMIN"]),
  (req, res, next) => {
    guideController.verifyGuide(req, res).catch(next);
  },
);

router.patch(
  "/:guideId/reject",
  authenticate,
  authorize(["ADMIN"]),
  (req, res, next) => {
    guideController.rejectGuide(req, res).catch(next);
  },
);

router.patch(
  "/:guideId/reject",
  authenticate,
  authorize(["ADMIN"]),
  (req, res, next) => {
    guideController.rejectGuide(req, res).catch(next);
  },
);

export default router;
