import { getSession } from "@/lib/auth";
import React from "react";
import Archives from "./_components/archives-container";

export default async function page() {
  const session = await getSession();
  const user = session;
  return (
    <div>
      <Archives user={user} />
    </div>
  );
}
