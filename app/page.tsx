import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Home() {
  try {
    const session = await getSession();

    if (session) {
      redirect("/dashboard");
    }
  } catch {}

  redirect("/auth/login");
}
