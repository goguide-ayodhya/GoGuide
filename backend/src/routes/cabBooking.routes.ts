import { Router } from "express";
import { cabBookingController } from "../controllers/cabBooking.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Create booking (must be logged in)
router.post("/", authenticate, (req, res, next) => {
  cabBookingController.createBooking(req, res).catch(next);
});

// Get user's own bookings
router.get("/my-bookings", authenticate, (req, res, next) => {
  cabBookingController.getMyBookings(req, res).catch(next);
});

// Admin list all bookings
router.get("/admin/all", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.getAllBookings(req, res).catch(next);
});

// Update status (admin can update all statuses, tourist can cancel theirs)
router.patch("/:bookingId/status", authenticate, (req, res, next) => {
  cabBookingController.updateStatus(req, res).catch(next);
});

export default router;
