import { userService } from "../services/admin.service";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";

export class AdminController {
  async getUsers(req: AuthRequest, res: Response) {
    const role = typeof req.query.role === "string" ? req.query.role.toUpperCase() : undefined;
    const users = await userService.getAllUsers(role);
    res.json(users);
  }

  async blockUser(req: AuthRequest, res: Response) {
    const user = await userService.blockUser(req.params.id);
    res.json(user);
  }

  async activateUser(req: AuthRequest, res: Response) {
    const user = await userService.activateUser(req.params.id);
    res.json(user);
  }

  async deleteUser(req: AuthRequest, res: Response) {
    const result = await userService.softDeleteUser(req.params.id);
    res.json(result);
  }
  async suspendUser(req: AuthRequest, res: Response) {
    const user = await userService.suspendUser(req.params.id);
    res.json(user);
  }
}

export const adminController = new AdminController();
