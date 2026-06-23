import { userService } from "../services/admin.service";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";

export class AdminController {
  async getUsers(req: AuthRequest, res: Response) {
    const role = typeof req.query.role === "string" ? req.query.role.toUpperCase() : undefined;
    const status = typeof req.query.status === "string" ? req.query.status.toUpperCase() : undefined;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const verification = typeof req.query.verification === "string" ? req.query.verification : undefined;
    const page = typeof req.query.page === "string" ? parseInt(req.query.page) : 1;
    const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit) : 20;

    const result = await userService.getAllUsers({
      role,
      status,
      search,
      verification,
      page,
      limit,
    });
    res.json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  }

  async getUserDetail(req: AuthRequest, res: Response) {
    const user = await userService.getUserDetail(req.params.id);
    res.json(user);
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

  async verifyUser(req: AuthRequest, res: Response) {
    const result = await userService.verifyUser(req.params.id);
    res.json(result);
  }

  async unverifyUser(req: AuthRequest, res: Response) {
    const result = await userService.unverifyUser(req.params.id);
    res.json(result);
  }

  async suspendUser(req: AuthRequest, res: Response) {
    const { duration } = req.body;
    const user = await userService.suspendUser(req.params.id, duration);
    res.json(user);
  }

  async markUserAsViewed(req: AuthRequest, res: Response) {
    const result = await userService.markUserAsViewed(req.params.id);
    res.json(result);
  }
}

export const adminController = new AdminController();
