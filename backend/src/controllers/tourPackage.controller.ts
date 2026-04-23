import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { tourPackageService } from "../services/tourPackage.service";
import cloudinary from "../config/cloudinary";

export class TourPackageController {
  async createPackage(req: AuthRequest, res: Response) {
    try {
      const files = req.files as { images?: Express.Multer.File[] } | undefined;
      const body = { ...req.body } as any;
      // Parse JSON fields that may come as strings when using multipart/form-data
      try {
        if (typeof body.itinerary === "string" && body.itinerary.trim()) {
          body.itinerary = JSON.parse(body.itinerary);
        }
      } catch (e) {
        // ignore parse error
      }

      if (typeof body.images === "string" && body.images.trim()) {
        try {
          body.images = JSON.parse(body.images);
        } catch (e) {
          body.images = body.images.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }

      // normalize booleans and numbers
      if (body.includesCab === "true" || body.includesCab === "false") {
        body.includesCab = body.includesCab === "true";
      }
      if (body.includesGuide === "true" || body.includesGuide === "false") {
        body.includesGuide = body.includesGuide === "true";
      }
      if (body.price) body.price = Number(body.price);
      if (body.duration) body.duration = Number(body.duration);
      if (body.maxGroupSize) body.maxGroupSize = Number(body.maxGroupSize);
      if (body.priceBreakdown && typeof body.priceBreakdown === "string") {
        try {
          body.priceBreakdown = JSON.parse(body.priceBreakdown);
        } catch (e) {
          body.priceBreakdown = body.priceBreakdown;
        }
      }

      const images: string[] = [];
      if (files?.images?.length) {
        for (const file of files.images) {
          const result = await new Promise<{ secure_url: string }>(
            (resolve, reject) => {
              cloudinary.uploader
                .upload_stream({ resource_type: "image" }, (err, result) => {
                  if (err) return reject(err);
                  if (!result) return reject(new Error("Upload failed"));
                  resolve(result as any);
                })
                .end(file.buffer);
            },
          );
          images.push(result.secure_url);
        }
      }

      // allow images passed as JSON array too
      if (Array.isArray(body.images)) {
        body.images = body.images.concat(images);
      } else if (images.length) {
        body.images = images;
      }

      const adminId = req.userId;
      const created = await tourPackageService.createPackage(body, adminId);

      res
        .status(201)
        .json({ success: true, message: "Package created", data: created });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Create package failed" });
    }
  }

  async getAllPackages(req: AuthRequest, res: Response) {
    try {
      const filters = {
        isActive:
          req.query.isActive !== undefined
            ? req.query.isActive === "true"
            : undefined,
        q: req.query.q,
      };
      const list = await tourPackageService.getAllPackages(filters);
      res
        .status(200)
        .json({ success: true, message: "Packages retrieved", data: list });
    } catch (error) {
      throw error;
    }
  }

  async getPackageById(req: AuthRequest, res: Response) {
    try {
      const pkg = await tourPackageService.getPackageById(req.params.packageId);
      res
        .status(200)
        .json({ success: true, message: "Package retrieved", data: pkg });
    } catch (error) {
      throw error;
    }
  }

  async updatePackage(req: AuthRequest, res: Response) {
    try {
      const files = req.files as { images?: Express.Multer.File[] } | undefined;
      const body = { ...req.body } as any;

      // Parse JSON fields if necessary
      try {
        if (typeof body.itinerary === "string" && body.itinerary.trim()) {
          body.itinerary = JSON.parse(body.itinerary);
        }
      } catch (e) {
        // ignore
      }

      if (typeof body.images === "string" && body.images.trim()) {
        try {
          body.images = JSON.parse(body.images);
        } catch (e) {
          body.images = body.images.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }

      if (body.includesCab === "true" || body.includesCab === "false") {
        body.includesCab = body.includesCab === "true";
      }
      if (body.includesGuide === "true" || body.includesGuide === "false") {
        body.includesGuide = body.includesGuide === "true";
      }
      if (body.price) body.price = Number(body.price);
      if (body.duration) body.duration = Number(body.duration);
      if (body.maxGroupSize) body.maxGroupSize = Number(body.maxGroupSize);
      if (body.priceBreakdown && typeof body.priceBreakdown === "string") {
        try {
          body.priceBreakdown = JSON.parse(body.priceBreakdown);
        } catch (e) {
          body.priceBreakdown = body.priceBreakdown;
        }
      }

      const images: string[] = [];
      if (files?.images?.length) {
        for (const file of files.images) {
          const result = await new Promise<{ secure_url: string }>(
            (resolve, reject) => {
              cloudinary.uploader
                .upload_stream({ resource_type: "image" }, (err, result) => {
                  if (err) return reject(err);
                  if (!result) return reject(new Error("Upload failed"));
                  resolve(result as any);
                })
                .end(file.buffer);
            },
          );
          images.push(result.secure_url);
        }
      }

      // merge images if provided
      if (Array.isArray(body.images)) {
        body.images = body.images.concat(images);
      } else if (images.length) {
        body.images = images;
      }

      const updated = await tourPackageService.updatePackage(
        req.params.packageId,
        body,
      );
      res
        .status(200)
        .json({ success: true, message: "Package updated", data: updated });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Update failed" });
    }
  }

  async deletePackage(req: AuthRequest, res: Response) {
    try {
      const deleted = await tourPackageService.deletePackage(
        req.params.packageId,
      );
      res
        .status(200)
        .json({ success: true, message: "Package deleted", data: deleted });
    } catch (error) {
      throw error;
    }
  }
}

export const tourPackageController = new TourPackageController();
