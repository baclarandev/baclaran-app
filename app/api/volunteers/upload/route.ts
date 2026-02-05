import formidable from "formidable";
import fs from "fs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cloudinary } from "@/app/lib/cloudinary";

export const config = {
  api: { bodyParser: false }, // required for file uploads
};

export async function POST(req: any) {
  try {
    const form = new formidable.IncomingForm();

    const { fields, files }: any = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    let profilePictureUrl = "";

    if (files.profilePicture) {
      const file = files.profilePicture;
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: "volunteers", // optional: organize in folder
      });
      profilePictureUrl = result.secure_url;
    }

    const volunteer = await prisma.volunteer.create({
      data: {
        firstName: fields.firstName,
        lastName: fields.lastName,
        email: fields.email,
        sex: fields.sex,
        civilStatus: fields.civilStatus || "Single", // default if not provided
        profilePicture: profilePictureUrl,
        volunteerCode: `VOL-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // generate a unique volunteer code
        status: "ACTIVE", // optional: defaults to ACTIVE in your model
      },
    });

    return NextResponse.json(
      { message: "Volunteer created", data: volunteer },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("[CREATE_VOLUNTEER_ERROR]", err);
    return NextResponse.json(
      { error: err.message || "Failed" },
      { status: 500 },
    );
  }
}
