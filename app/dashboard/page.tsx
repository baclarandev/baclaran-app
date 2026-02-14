import { getSession } from "@/lib/auth";

import { redirect } from "next/navigation";
import Dashboard from "./_components/dashboard";
export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }
  const user = session;

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100">
      <Dashboard user={user} />
    </div>
  );
}
