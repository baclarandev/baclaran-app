export const runtime = "nodejs"; // at the top of route.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset || reset.expiresat < new Date()) {
    return new Response("Invalid or expired token", { status: 400 });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user
  await prisma.user.update({
    where: { email: reset.email },
    data: { password: hashedPassword },
  });

  // Delete token
  await prisma.passwordReset.delete({ where: { token } });

  return new Response("Password reset successfully", { status: 200 });
}
