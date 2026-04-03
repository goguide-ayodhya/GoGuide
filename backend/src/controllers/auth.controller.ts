import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { authService } from "../services/auth.service";
import { LoginInput } from "../validations/auth";
import { Unauthorized } from "../utils/httpException";
import { User } from "../models/User";
import cloudinary from "../config/cloudinary";

export class AuthController {
  // --------------------- Authentication ---------------------
  async login(req: AuthRequest, res: Response) {
    try {
      const input: LoginInput = req.body;
      const result = await authService.login(input);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  async signup(req: AuthRequest, res: Response) {
    try {
      let avatarUrl = "";
      if (req.file) {
        const result = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  resource_type: "image",
                },
                (err, result) => {
                  if (err) reject(err);
                  else if (result) resolve(result);
                  else reject(new Error("Upload failed: no result returned"));
                },
              )
              .end(req.file?.buffer);
          },
        );
        avatarUrl = result.secure_url;
      }

      const response = await authService.signup({
        ...req.body,
        avatar: avatarUrl,
      });

      res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: response,
      });
    } catch (error) {
      throw error;
    }
  }

  async validateToken(req: AuthRequest, res: Response) {
    try {
      const token = req.headers.authorization?.substring(7);

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required",
        });
      }

      const decoded = await authService.validateToken(token);

      res.status(200).json({
        success: true,
        message: "Token is valid",
        data: decoded,
      });
    } catch (error) {
      throw error;
    }
  }

  async logout(req: AuthRequest, res: Response) {
    try {
      await authService.logout();
      res.status(200).json({
        success: true,
        message: "User logout successfully",
      });
    } catch (error) {
      throw error;
    }
  }

  async logoutAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new Unauthorized("User not authenticated");
      }
      const result = await authService.logoutAll(userId);

      res.status(200).json({
        success: true,
        message: "User logout successfully",
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  async changePassword(req: AuthRequest, res: Response) {
    const userId = req.userId;
    if (!userId) {
      throw new Unauthorized("User not authenticated");
    }

    const result = await authService.changePassword(
      userId,
      req.body.currentPassword,
      req.body.newPassword,
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  }

  // --------------------- User Management ---------------------
  async getUserById(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    res.status(200).json({
      success: true,
      data: user,
    });
  }
}

export const authController = new AuthController();
