import express from 'express';
const router = express.Router();
import { authenticate } from '../middleware/auth';
import * as mapController from '../controllers/map.controller';
import { query } from 'express-validator';

router.get('/get-coordinates',
    query('address').isString().isLength({ min: 3 }),
    authenticate,
    mapController.getCoordinates
);

router.get('/get-distance-time',
    query('origin').isString().isLength({ min: 3 }),
    query('destination').isString().isLength({ min: 3 }),
    authenticate,
    mapController.getDistanceTime
)

router.get('/get-suggestions',
    query('input').isString().isLength({ min: 3 }),
    authenticate,
    mapController.getAutoCompleteSuggestions
)



export default router;