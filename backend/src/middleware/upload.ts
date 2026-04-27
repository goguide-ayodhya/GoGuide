import multer from "multer";
import { Request, Response, NextFunction } from "express";
const storage = multer.memoryStorage();
const MAX_FILE_SIZE = Number(process.env.MAX_UPLOAD_SIZE) || 5 * 1024 * 1024; // 5MB default
const ALLOWED_MIMETYPES = ["image/jpeg", "image/png", "image/webp"];

const multerInstance = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Only jpg, png and webp are allowed."));
  },
});

// Export an object with a compatible `fields` method so existing routes can call `upload.fields(...)`.
// The returned middleware runs multer then maps the single main image into `req.file` for compatibility.
export const upload = {
  fields: (fields: multer.Field[]) => {
    const uploadFields = multerInstance.fields(fields);
    const mapMainImage = (req: Request, res: Response, next: NextFunction) => {
      const files = req.files as any;
      if (files && files.mainImageFile && Array.isArray(files.mainImageFile) && files.mainImageFile.length) {
        // Some controllers expect req.file for single uploads — provide it here
        (req as any).file = files.mainImageFile[0];
      }
      // Ensure req.files.images exists as an array (may be undefined if no images uploaded)
      if (files && files.images && !Array.isArray(files.images)) {
        files.images = [files.images];
      }
      next();
    };
    // Return an array of middlewares (express accepts arrays) — keeps compatibility with current routes.
    return [uploadFields, mapMainImage] as unknown as any;
  },
};
