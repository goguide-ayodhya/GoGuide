import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { cabService } from "../services/cab.service";

export class CabController {
  async createCab(req: AuthRequest, res: Response) {
    const cab = await cabService.createCab(req.userId!, req.body);

    res.status(201).json({
      success: true,
      message: "Cab booked successfully",
      data: cab,
    });
  }

  async getMyCabs(req: AuthRequest, res: Response) {
    const cabs = await cabService.getMyCabs(req.userId!);

    res.status(200).json({
      success: true,
      data: cabs,
    });
  }

  async cancelCab(req: AuthRequest, res: Response) {
    const cab = await cabService.cancelCab(req.params.cabId, req.userId!);

    res.status(200).json({
      success: true,
      message: "Cab cancelled",
      data: cab,
    });
  }
}

export const cabController = new CabController();
