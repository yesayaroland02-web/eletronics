import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

// gagal cepat kalau env belum terisi
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn("⚠️ Konfigurasi Cloudinary di .env belum lengkap.");
}

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME.trim(),
    api_key: CLOUDINARY_API_KEY.trim(),
    api_secret: CLOUDINARY_API_SECRET.trim(),
    secure: true,
  });
}

// upload file buffer dari Multer ke Cloudinary

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "warmad-products",
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("CLOUDINARY ERROR:", {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
          });

          return reject(error);
        }

        if (!result) {
          return reject(new Error("Cloudinary tidak mengembalikan hasil upload"));
        }

        resolve(result);
      },
    );

    uploadStream.on("error", (error) => {
      console.error("CLOUDINARY STREAM ERROR:", error);
      reject(error);
    });

    uploadStream.end(fileBuffer);
  });
}


// hapus file dari cloudinary menggunakan Public ID
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}