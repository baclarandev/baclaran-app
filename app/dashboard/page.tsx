import { getSession } from "@/lib/auth";
import Dashboard from "./_components/dashboard";
import { redirect } from "next/navigation";
export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }
  const user = session;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Dashboard user={user} />
    </div>
  );
}

/* ---------------- Skeleton ---------------- */
