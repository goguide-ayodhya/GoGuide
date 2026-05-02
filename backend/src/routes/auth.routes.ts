import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import {
  loginSchema,
  signupSchema,
  changePasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth";
import { upload } from "../middleware/upload";

const router = Router();

// --------------------- Authentication ---------------------

router.post("/login", validate(loginSchema), (req, res, next) => {
  authController.login(req, res).catch(next);
});

router.post(
  "/signup",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
    { name: "driverPhoto", maxCount: 1 },
    { name: "vehiclePhoto", maxCount: 1 },
    { name: "driverLicense", maxCount: 1 },
  ]),
  validate(signupSchema),
  (req, res, next) => {
    authController.signup(req, res).catch(next);
  },
);

router.post("/logout", authenticate, (req, res, next) => {
  authController.logout(req, res).catch(next);
});

router.post("/logoutall", authenticate, (req, res, next) => {
  authController.logoutAll(req, res).catch(next);
});

router.post("/send-otp", validate(sendOtpSchema), (req, res) => {
  authController.sendOtp(req, res).catch((err) => {
    console.error("SEND OTP ERROR:", err);
    return res.status(200).json({
      success: false,
      message: "Failed to send OTP",
    });
  });
});
router.post("/verify-email", (req, res, next) => {
  authController.verifyEmail(req, res).catch(next);
});

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  (req, res, next) => {
    authController.forgotPassword(req, res).catch(next);
  },
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  (req, res, next) => {
    authController.resetPassword(req, res).catch(next);
  },
);

// --------------------- User Management ---------------------
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  (req, res, next) => {
    authController.changePassword(req, res).catch(next);
  },
);

router.get("/user/:id", authenticate, (req, res, next) => {
  authController.getUserById(req, res).catch(next);
});

router.get("/validate-token", authenticate, (req, res, next) => {
  authController.validateToken(req, res).catch(next);
});

router.get("/me", authenticate, (req, res, next) => {
  authController.getMe(req, res).catch(next);
});

export default router;
