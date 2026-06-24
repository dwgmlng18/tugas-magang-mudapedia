import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = "caelas/products"
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: "image" }, (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload gagal"));
        resolve(result.secure_url);
      })
      .end(buffer);
  });
}

export async function deleteFromCloudinary(imageUrl: string): Promise<void> {
  try {
    const parts   = imageUrl.split("/upload/");
    const afterUpload = parts[1];
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    const publicId = withoutVersion.replace(/\.[^/.]+$/, "");

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Gagal hapus gambar Cloudinary:", err);
  }
}

export default cloudinary;