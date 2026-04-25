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
  const htmlEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #1e40af; /* navy blue */
      color: white;
      text-align: center;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px 20px;
      text-align: center;
    }
    .content p {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 30px;
    }
    .btn {
      display: inline-block;
      padding: 12px 25px;
      font-size: 16px;
      color: #ffffff;
      background-color: #1e40af;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #999999;
      padding: 20px;
    }
    .footer a {
      color: #1e40af;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      Reset Your Password
    </div>
    <div class="content">
      <p>Hi there,</p>
      <p>We received a request to reset your password. Click the button below to reset it. This link is valid for 1 hour.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p>If you didn’t request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      &copy; 2026 National Shrine of Our Mother of Perpetual Help. All rights reserved.<br>
      Need help? <a href="mailto:baclarandev@gmail.com">Contact Support</a>
    </div>
  </div>
</body>
</html>
`;
  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: htmlEmail,
  });

  return new Response("Reset email sent", { status: 200 });
}
