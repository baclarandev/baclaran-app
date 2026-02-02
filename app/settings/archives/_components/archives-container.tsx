import FeatureNotAvailable from "@/components/feature-not-available";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function Archives({ user }: any) {
  return (
    <>
      <Sidebar user={user} />
      <Header user={user} />
      <FeatureNotAvailable />
    </>
  );
}
