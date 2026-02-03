import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function getSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw new Error("NO_TOKEN");
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!);
    return decoded;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new Error("TOKEN_EXPIRED");
    }
    throw err;
  }
}
