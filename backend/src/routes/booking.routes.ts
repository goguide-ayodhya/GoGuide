import { Router } from "express";
import { bookingController } from "../controllers/booking.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  createBookingSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
} from "../validations/booking";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createBookingSchema),
  (req, res, next) => {
    bookingController.createBooking(req, res).catch(next);
  },
);

router.get("/my-bookings", authenticate, (req, res, next) => {
  bookingController.getMyBookings(req, res).catch(next);
});

router.get("/guide", authenticate, (req, res, next) => {
  bookingController.getGuideBookings(req, res).catch(next);
});

router.get("/driver", authenticate, (req, res, next) => {
  bookingController.getDriverBookings(req, res).catch(next);
});

router.get(
  "/admin/all",
  authenticate,
  authorize(["ADMIN"]),
  (req, res, next) => {
    bookingController.getAllBookings(req, res).catch(next);
  },
);

router.get("/:bookingId", authenticate, (req, res, next) => {
  bookingController.getBookingById(req, res).catch(next);
});

router.patch(
  "/:bookingId/cancel",
  authenticate,
  validate(cancelBookingSchema),
  (req, res, next) => {
    bookingController.cancelBooking(req, res).catch(next);
  },
);

// guide actions
router.patch("/:bookingId/accept", authenticate, (req, res, next) => {
  bookingController.acceptBooking(req, res).catch(next);
});

router.patch("/:bookingId/reject", authenticate, (req, res, next) => {
  bookingController.rejectBooking(req, res).catch(next);
});

router.post("/:packageId/create-order", authenticate, (req, res, next) => {
  bookingController.createPackageBooking(req, res).catch(next);
});

router.patch("/:bookingId/complete", authenticate, (req, res, next) => {
  bookingController.completeBooking(req, res).catch(next);
});

// admin
router.patch(
  "/:bookingId/seen",
  authenticate,
  authorize(["ADMIN"]),
  (req, res, next) => {
    bookingController.markSeen(req, res).catch(next);
  },
);

export default router;
