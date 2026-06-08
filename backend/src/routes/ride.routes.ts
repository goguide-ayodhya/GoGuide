import express from 'express';
const router = express.Router();
import { body, query } from 'express-validator';
import * as rideController from '../controllers/ride.controller';
import { authenticate, authorize } from '../middleware/auth';


router.post('/create',
    authenticate,
    authorize(['TOURIST']),
    body('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    body('vehicleType').isString().isIn([ 'auto', 'car', 'moto' ]).withMessage('Invalid vehicle type'),
    rideController.createRide
);

router.get('/get-fare',
    authenticate,
    authorize(['TOURIST']),
    query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    rideController.getFare
);

router.post('/confirm',
    authenticate,
    authorize(['DRIVER']),
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.confirmRide
);

router.get('/start-ride',
    authenticate,
    authorize(['DRIVER']),
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    query('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
    rideController.startRide
);

router.post('/end-ride',
    authenticate,
    authorize(['DRIVER']),
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
);

router.post('/confirm-payment',
    authenticate,
    authorize(['TOURIST']),
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    body('paymentMethod').isString().isIn(['cash', 'card', 'wallet']).withMessage('Invalid payment method'),
    rideController.confirmPayment
);

router.get('/pending-rides',
    authenticate,
    authorize(['DRIVER']),
    rideController.getPendingRides
);

router.get('/active',
    authenticate,
    authorize(['TOURIST', 'DRIVER']),
    rideController.getActiveRide
);

router.post('/submit-review',
    authenticate,
    authorize(['TOURIST']),
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    body('rating').isInt({min: 0, max: 5}).withMessage('Rating must be between 0 and 5'),
    body('text').isString().trim().optional().withMessage('Review text must be a string'),
    body('skip').isBoolean().optional().withMessage('Skip must be a boolean'),
    rideController.submitReview
);

// [RIDE_STATE_MACHINE] Cancel ride — only allowed in pending/accepted status
// Allowed by TOURIST or DRIVER (driver may cancel an accepted ride they cannot service)
router.post('/cancel',
    authenticate,
    authorize(['TOURIST', 'DRIVER']),
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.cancelRide
);

export default router;