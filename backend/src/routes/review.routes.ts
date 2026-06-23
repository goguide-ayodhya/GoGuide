import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const uploadMiddleware = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

// Optional auth helper to set req.userId if a token is present, but not throw if missing
const optionalAuthenticate = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token && token !== "null" && token !== "undefined") {
        const jwt = require("jsonwebtoken");
        const { env } = require("../config/environment");
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.userId = decoded.userId;
        
        // Also load full user details for authorization flags
        const { User } = require("../models/User");
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = { role: user.role, status: user.status };
        }
      }
    }
    next();
  } catch (err) {
    next(); // fail silently and treat as guest
  }
};

// ─── Public Website Reviews ───────────────────────────────────────────────────
router.post('/website', (req, res, next) => {
  reviewController.createWebsiteReview(req, res).catch(next);
});

router.get('/website', (req, res, next) => {
  reviewController.getWebsiteReviews(req, res).catch(next);
});

router.get('/website/stats', (req, res, next) => {
  reviewController.getWebsiteStats(req, res).catch(next);
});

// ─── Public Upload Route ─────────────────────────────────────────────────────
router.post('/upload', uploadMiddleware.array('images', 5), (req, res, next) => {
  reviewController.uploadReviewImages(req, res).catch(next);
});

// ─── Public Lists & Actions (Helpful / Report) ───────────────────────────────
router.get('/', (req, res, next) => {
  reviewController.getReviewsAdmin(req, res).catch(next);
});

router.patch('/:reviewId/helpful', optionalAuthenticate, (req, res, next) => {
  reviewController.toggleHelpful(req, res).catch(next);
});

router.patch('/:reviewId/report', (req, res, next) => {
  reviewController.reportReview(req, res).catch(next);
});

// ─── Guide/Driver Reviews (Authenticate Required) ─────────────────────────────
router.post('/booking/:bookingId', authenticate, (req, res, next) => {
  reviewController.createReview(req, res).catch(next);
});

router.get('/guide/:guideId', (req, res, next) => {
  reviewController.getGuideReviews(req, res).catch(next);
});

router.get('/driver/:driverId', (req, res, next) => {
  reviewController.getDriverReviews(req, res).catch(next);
});

router.get('/booking/:bookingId', authenticate, (req, res, next) => {
  reviewController.getBookingReview(req, res).catch(next);
});

router.put('/:reviewId', authenticate, (req, res, next) => {
  reviewController.updateReview(req, res).catch(next);
});

// ─── Administration (Admin Access Required) ──────────────────────────────────
router.get('/admin/analytics', authenticate, authorize(['ADMIN']), (req, res, next) => {
  reviewController.getAdminAnalytics(req, res).catch(next);
});

router.patch('/:reviewId/featured', authenticate, authorize(['ADMIN']), (req, res, next) => {
  reviewController.toggleFeatured(req, res).catch(next);
});

router.delete('/:reviewId', authenticate, (req, res, next) => {
  reviewController.deleteReview(req, res).catch(next);
});

export default router;
