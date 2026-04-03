import { Router } from "express";
import { passController } from "../controllers/pass.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// ADMIN create
router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  (req, res, next) => {
    passController.createPass(req, res).catch(next);
  },
);

// PUBLIC
router.get("/", (req, res, next) => {
  passController.getAllPasses(req, res).catch(next);
});

router.get("/:passId", (req, res, next) => {
  passController.getPassById(req, res).catch(next);
});

export default router;