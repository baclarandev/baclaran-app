"use server";

import { getSession } from "@/lib/auth";
import Ministries from "./_components/ministries-container";

export default async function MinistriesPage() {
  const session = await getSession();
  const user = session;
  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100">
      <Ministries user={user} />
    </div>
  );
}
