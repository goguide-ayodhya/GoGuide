import { Router } from "express";
import { cabBookingController } from "../controllers/cabBooking.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Public routes (anyone can search/calculate price, locations, categories)
router.get("/locations", (req, res, next) => {
  cabBookingController.getLocations(req, res).catch(next);
});

router.get("/categories", (req, res, next) => {
  cabBookingController.getCategories(req, res).catch(next);
});

router.get("/price", (req, res, next) => {
  cabBookingController.getLivePrice(req, res).catch(next);
});

// Create booking (must be logged in)
router.post("/", authenticate, (req, res, next) => {
  cabBookingController.createBooking(req, res).catch(next);
});

// Get user's own bookings
router.get("/my-bookings", authenticate, (req, res, next) => {
  cabBookingController.getMyBookings(req, res).catch(next);
});

// Reschedule booking (must be logged in)
router.patch("/:bookingId/reschedule", authenticate, (req, res, next) => {
  cabBookingController.rescheduleBooking(req, res).catch(next);
});

// Update status (admin can update all statuses, tourist can cancel theirs if time allows)
router.patch("/:bookingId/status", authenticate, (req, res, next) => {
  cabBookingController.updateStatus(req, res).catch(next);
});

// Confirm payment by admin
router.patch("/:bookingId/confirm-payment", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.confirmPayment(req, res).catch(next);
});

// Admin list all bookings
router.get("/admin/all", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.getAllBookings(req, res).catch(next);
});

// Admin location management
router.post("/admin/locations", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.createLocation(req, res).catch(next);
});

router.put("/admin/locations/:id", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.updateLocation(req, res).catch(next);
});

router.delete("/admin/locations/:id", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.deleteLocation(req, res).catch(next);
});

// Admin category management
router.post("/admin/categories", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.createCategory(req, res).catch(next);
});

router.put("/admin/categories/:id", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.updateCategory(req, res).catch(next);
});

router.delete("/admin/categories/:id", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.deleteCategory(req, res).catch(next);
});

// Admin price configuration management
router.get("/admin/prices", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.getPrices(req, res).catch(next);
});

router.post("/admin/prices", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.createPrice(req, res).catch(next);
});

router.put("/admin/prices/:id", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.updatePrice(req, res).catch(next);
});

router.delete("/admin/prices/:id", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.deletePrice(req, res).catch(next);
});

// Admin tax configuration
router.get("/admin/tax", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.getTax(req, res).catch(next);
});

router.put("/admin/tax", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.updateTax(req, res).catch(next);
});

// Additional charges routes (public get, admin update)
router.get("/additional-charges", (req, res, next) => {
  cabBookingController.getAdditionalCharges(req, res).catch(next);
});

router.get("/admin/additional-charges", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.getAdditionalCharges(req, res).catch(next);
});

router.put("/admin/additional-charges", authenticate, authorize(["ADMIN"]), (req, res, next) => {
  cabBookingController.updateAdditionalCharges(req, res).catch(next);
});

export default router;
