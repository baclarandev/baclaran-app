import FeatureNotAvailable from "@/components/feature-not-available";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import React from "react";

export default function Role({ user }: any) {
  return (
    <>
      <Sidebar user={user} />
      <Header user={user} />
      <FeatureNotAvailable />
    </>
  );
}
