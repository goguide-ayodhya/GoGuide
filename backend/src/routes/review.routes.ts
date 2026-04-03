import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/booking/:bookingId', authenticate, (req, res, next) => {
  reviewController.createReview(req, res).catch(next);
});

router.get('/guide/:guideId', authenticate, (req, res, next) => {
  reviewController.getGuideReviews(req, res).catch(next);
});

router.get('/booking/:bookingId', authenticate, (req, res, next) => {
  reviewController.getBookingReview(req, res).catch(next);
});

router.put('/:reviewId', authenticate, (req, res, next) => {
  reviewController.updateReview(req, res).catch(next);
});

router.delete('/:reviewId', authenticate, (req, res, next) => {
  reviewController.deleteReview(req, res).catch(next);
});

export default router;
