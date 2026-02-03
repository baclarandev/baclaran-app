import { cookies } from "next/headers";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { prisma } from "./prisma";

type Role = "ADMIN" | "CHAIRMAN" | "STAFF" | "VOLUNTEER";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface SessionUser {
  id: number;
  email: string;
  role: Role;
  ministryId?: number | null;
  createdAt: Date;
}

export async function getSession(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw new Error("NO_TOKEN");
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET) as { id: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        ministryId: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return user;
  } catch (err: any) {
    if (err instanceof TokenExpiredError) {
      throw new Error("TOKEN_EXPIRED");
    }
    throw new Error("INVALID_TOKEN");
  }
}
