import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { cloudinary } from "@/app/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    console.log("[UPLOAD] Received upload request");

    const formData = await req.formData();
    const file = formData.get("profilePicture") as File | null;

    if (!file) {
      console.log("[UPLOAD] No file in request");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log(
      `[UPLOAD] File received: ${file.name}, size: ${file.size} bytes, type: ${file.type}`,
    );

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      console.log(`[UPLOAD] File too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: "File too large. Max 10 MB." },
        { status: 400 },
      );
    }

    // Convert File → Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("[UPLOAD] Converted file to buffer");

    // Save temporarily (Cloudinary uploader needs a file path)
    const tempPath = path.join(os.tmpdir(), file.name);
    await fs.writeFile(tempPath, buffer);
    console.log(`[UPLOAD] File written temporarily at: ${tempPath}`);

    // Upload: ✅ Strict-safe
    console.log("[UPLOAD] Uploading to Cloudinary...");
    const upload = await cloudinary.uploader.upload(tempPath, {
      folder: "volunteers",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      resource_type: "image",
      transformation: [
        { width: 2000, crop: "limit" }, // resize to max 2000px width
        { quality: "auto" }, // compress automatically
      ],
    });
    console.log("[UPLOAD] Upload successful:", upload.secure_url);

    // Cleanup
    await fs.unlink(tempPath);
    console.log("[UPLOAD] Temporary file removed");

    return NextResponse.json({ url: upload.secure_url });
  } catch (err) {
    console.error("[UPLOAD_ERROR]", err);
    return NextResponse.json(
      { error: "Image upload failed", details: err },
      { status: 500 },
    );
  }
}
