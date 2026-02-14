import { getSession } from "@/lib/auth";
import VolunteerInfo from "./_components/volunteer-info-container";

export default async function Page() {
  const session = await getSession();
  const user = session;

  return (
    <div className=" min-h-screen bg-neutral-900 text-gray-100">
      <VolunteerInfo user={user} />
    </div>
  );
}
