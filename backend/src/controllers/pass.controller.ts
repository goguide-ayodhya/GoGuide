import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { passService } from "../services/pass.service";

export class PassController {
  async createPass(req: AuthRequest, res: Response) {
    const pass = await passService.createPass(req.userId!, req.body);

    res.status(201).json({
      success: true,
      message: "Pass created",
      data: pass,
    });
  }

  async getAllPasses(req: AuthRequest, res: Response) {
    const passes = await passService.getAllPasses();

    res.status(200).json({
      success: true,
      data: passes,
    });
  }

  async getPassById(req: AuthRequest, res: Response) {
    const pass = await passService.getPassById(req.params.passId);

    res.status(200).json({
      success: true,
      data: pass,
    });
  }
}

export const passController = new PassController();