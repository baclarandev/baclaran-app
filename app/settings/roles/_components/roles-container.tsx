import { useMinistries } from "@/app/services/ministries";
import FeatureNotAvailable from "@/components/feature-not-available";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import React from "react";

export default function Role({ user }: any) {
    const { data: ministries = [], isLoading, error } = useMinistries();
  return (
    <>
      <Sidebar user={user}  />
      <Header user={user} />
      <FeatureNotAvailable />
    </>
  );
}
