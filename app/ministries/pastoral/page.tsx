// pages/ministries/pastoral.tsx
"use client";

import MinistriesClientBase from "../_base";

export default function PastoralPage({ user }: any) {
  return <MinistriesClientBase user={user} ministryType="PASTORAL" />;
}
