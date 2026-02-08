import { cloudinary } from "@/app/lib/cloudinary";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(req: Request) {
  console.log("[UPLOAD] POST request received");

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Resize & compress with Sharp
    const resizedBuffer = await sharp(buffer)
      .resize({ width: 512, height: 512, fit: "inside" })
      .jpeg({ quality: 80 })
      .toBuffer();

    return await new Promise<Response>((resolve) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          transformation: [
            { width: 512, height: 512, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            resolve(
              NextResponse.json(
                { error: "Cloudinary upload failed", details: error },
                { status: 500 },
              ),
            );
          } else {
            resolve(NextResponse.json({ url: result?.secure_url }));
          }
        },
      );

      upload.end(resizedBuffer);
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected upload error", details: err },
      { status: 500 },
    );
  }
}
