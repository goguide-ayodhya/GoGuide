import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { tourPackageService } from "../services/tourPackage.service";
import fileUploadService from "../services/fileUpload.service";

export class TourPackageController {
  async createPackage(req: AuthRequest, res: Response) {
    try {
      const files = req.files as { images?: Express.Multer.File[]; mainImageFile?: Express.Multer.File[] } | undefined;
      const body = { ...req.body } as any;
      // Parse JSON fields that may come as strings when using multipart/form-data
      try {
        if (typeof body.itinerary === "string" && body.itinerary.trim()) {
          body.itinerary = JSON.parse(body.itinerary);
        }
        if (typeof body.locations === "string" && body.locations.trim()) {
          body.locations = JSON.parse(body.locations);
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
      if (body.basePrice) body.basePrice = Number(body.basePrice);
      if (body.cabPrice) body.cabPrice = Number(body.cabPrice);
      if (body.guidePrice) body.guidePrice = Number(body.guidePrice);
      if (body.discount) body.discount = Number(body.discount);
      if (body.soldCount) body.soldCount = Number(body.soldCount);
      if (body.type) body.type = String(body.type).toLowerCase();
      if (body.location) body.location = String(body.location);
      if (body.state) body.state = String(body.state);
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
      let uploadedMainImage: string | undefined;

      // upload images[] if provided
      if (files?.images?.length) {
        const buffers = files.images.map((f: Express.Multer.File) => ({ buffer: f.buffer, originalname: f.originalname }));
        const urls = await fileUploadService.uploadMultipleBuffers(buffers);
        images.push(...urls);
      }

      // upload mainImageFile if provided
      if (files?.mainImageFile && files.mainImageFile.length) {
        const mfile = files.mainImageFile[0];
        uploadedMainImage = await fileUploadService.uploadBufferToStorage(mfile.buffer, mfile.originalname);
      }

      // allow images passed as JSON array too; set mainImage
      if (Array.isArray(body.images)) {
        body.images = body.images.concat(images);
      } else if (images.length) {
        body.images = images;
      }
      // determine mainImage: explicit field, uploaded mainImageFile, or first uploaded image
      if (!body.mainImage) {
        if (uploadedMainImage) body.mainImage = uploadedMainImage;
        else if (body.images && body.images.length) body.mainImage = body.images[0];
        else if (images.length) body.mainImage = images[0];
      }

      // parse locations if passed as comma-separated string
      if (typeof body.locations === "string" && body.locations.trim() && !Array.isArray(body.locations)) {
        try {
          body.locations = JSON.parse(body.locations);
        } catch (e) {
          body.locations = body.locations.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }

      const adminId = req.userId;
      const created = await tourPackageService.createPackage(body, adminId);

      res.status(201).json({ success: true, package: created });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Create package failed" });
    }
  }

  async getAllPackages(req: AuthRequest, res: Response) {
    try {
      const filters: any = {};
      if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === "true";
      if (req.query.q) filters.q = String(req.query.q);
      if (req.query.type) filters.type = String(req.query.type).toLowerCase();
      if (req.query.minPrice) filters.minPrice = Number(req.query.minPrice);
      if (req.query.maxPrice) filters.maxPrice = Number(req.query.maxPrice);

      const list = await tourPackageService.getAllPackages(filters);
      res.status(200).json({ success: true, packages: list });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Failed to retrieve packages" });
    }
  }

  async getPackageById(req: AuthRequest, res: Response) {
    try {
      const pkg = await tourPackageService.getPackageById(req.params.packageId);
      res.status(200).json({ success: true, package: pkg });
    } catch (error) {
      throw error;
    }
  }

  async updatePackage(req: AuthRequest, res: Response) {
    try {
      const files = req.files as { images?: Express.Multer.File[]; mainImageFile?: Express.Multer.File[] } | undefined;
      const body = { ...req.body } as any;

      // Parse JSON fields if necessary
      try {
        if (typeof body.itinerary === "string" && body.itinerary.trim()) {
            body.itinerary = JSON.parse(body.itinerary);
          }
        if (typeof body.locations === "string" && body.locations.trim()) {
            try {
              body.locations = JSON.parse(body.locations);
            } catch (e) {
              body.locations = body.locations.split(",").map((s: string) => s.trim()).filter(Boolean);
            }
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
      let uploadedMainImage: string | undefined;
      if (files?.images?.length) {
        const buffers = files.images.map((f: Express.Multer.File) => ({ buffer: f.buffer, originalname: f.originalname }));
        const urls = await fileUploadService.uploadMultipleBuffers(buffers);
        images.push(...urls);
      }

      // upload mainImageFile if provided during update
      if (files?.mainImageFile && files.mainImageFile.length) {
        const mfile = files.mainImageFile[0];
        uploadedMainImage = await fileUploadService.uploadBufferToStorage(mfile.buffer, mfile.originalname);
      }

      // merge images if provided
      if (Array.isArray(body.images)) {
        body.images = body.images.concat(images);
      } else if (images.length) {
        body.images = images;
      }
      if (!body.mainImage) {
        if (uploadedMainImage) body.mainImage = uploadedMainImage;
        else if (body.images && body.images.length) body.mainImage = body.images[0];
        else if (images.length) body.mainImage = images[0];
      }

      if (typeof body.locations === "string" && body.locations.trim() && !Array.isArray(body.locations)) {
        try {
          body.locations = JSON.parse(body.locations);
        } catch (e) {
          body.locations = body.locations.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }

      const updated = await tourPackageService.updatePackage(req.params.packageId, body);
      res.status(200).json({ success: true, package: updated });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Update failed" });
    }
  }

  async deletePackage(req: AuthRequest, res: Response) {
    try {
      const deleted = await tourPackageService.deletePackage(req.params.packageId);
      res.status(200).json({ success: true, package: deleted });
    } catch (error) {
      throw error;
    }
  }
}

export const tourPackageController = new TourPackageController();
