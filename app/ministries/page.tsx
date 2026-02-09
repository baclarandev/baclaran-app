"use server";

import { getSession } from "@/lib/auth";
import MinistriesClient from "./_components/ministries-container";

export default async function MinistriesPage() {
  const session = await getSession();
  const user = session
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <MinistriesClient user={user} />
    </div>
  );
}
