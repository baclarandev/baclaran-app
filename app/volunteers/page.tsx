import { getSession } from "@/lib/auth";
import Volunteer from "./_components/volunteer-container";

export default async function VolunteersPage() {
  const session = await getSession();
  const user = session;
  return (
    <div className=" min-h-screen bg-gray-900 text-gray-100">
      <Volunteer user={user} />
    </div>
  );
}
