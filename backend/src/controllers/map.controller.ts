import * as mapService from '../services/maps.service';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const getCoordinates = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const address = req.query.address as string;

    try {
        const coordinates = await mapService.getAddressCoordinate(address);
        return res.status(200).json(coordinates);
    } catch (error) {
        return res.status(404).json({ message: 'Coordinates not found' });
    }
};

export const getAddressFromCoordinates = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    try {
        const addressData = await mapService.getAddressFromCoordinates(lat, lng);
        return res.status(200).json(addressData);
    } catch (error) {
        return res.status(404).json({ message: 'Address not found' });
    }
};

export const getDistanceTime = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const origin = req.query.origin as string;
        const destination = req.query.destination as string;

        const distanceTime = await mapService.getDistanceTime(origin, destination);

        return res.status(200).json(distanceTime);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAutoCompleteSuggestions = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const input = req.query.input as string;

        const suggestions = await mapService.getAutoCompleteSuggestions(input);

        return res.status(200).json(suggestions);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
