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

router.get('/pending-rides',
    authenticate,
    authorize(['DRIVER']),
    rideController.getPendingRides
);

export default router;