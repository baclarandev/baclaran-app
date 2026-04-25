import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.volunteer.findUnique({ where: { email } });
  if (!user)
    return new Response("If your email exists, you will get a reset link", {
      status: 200,
    });

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordReset.create({
    data: { email, token, expiresat: expiresAt },
  });

  // Send email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  return new Response("Reset email sent", { status: 200 });
}
