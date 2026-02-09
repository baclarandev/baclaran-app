
"use client";

import MinistriesClientBase from "../_base"; 

export default function LiturgicalPage({ user }: any) {
  return <MinistriesClientBase user={user} ministryType="LITURGICAL" />;
}
