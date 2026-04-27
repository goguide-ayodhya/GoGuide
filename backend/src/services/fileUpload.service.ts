import path from "path";
import fs from "fs";
import cloudinary from "../config/cloudinary";

export async function uploadBufferToStorage(buffer: Buffer, filename: string): Promise<string> {
  // If Cloudinary is configured (env vars set), upload there
  const hasCloudConfig = Boolean(process.env.cloud_name && process.env.api_key && process.env.api_secret);
  if (hasCloudConfig) {
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (err: any, res: any) => {
          if (err) return reject(err);
          resolve(res);
        })
        .end(buffer);
    });
    return result.secure_url;
  }

  // Fallback: persist to local uploads folder and return a relative path
  const uploadsDir = path.join(__dirname, "../../uploads");
  await fs.promises.mkdir(uploadsDir, { recursive: true });
  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const outPath = path.join(uploadsDir, safeName);
  await fs.promises.writeFile(outPath, buffer);
  // Return a URL path that can be served by static middleware (configure express.static('/uploads'))
  return `/uploads/${safeName}`;
}

export async function uploadMultipleBuffers(files: { buffer: Buffer; originalname: string }[]) {
  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadBufferToStorage(file.buffer, file.originalname);
    urls.push(url);
  }
  return urls;
}

export default { uploadBufferToStorage, uploadMultipleBuffers };
