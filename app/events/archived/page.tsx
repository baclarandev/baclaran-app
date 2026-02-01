import { getSession } from "@/lib/auth";
import EventArchive from "./_components/event-archive";

export default async function page() {
  const session = await getSession();
  const user = session;
  return (
    <div className=" bg-gray-900 min-h-screen text-gray-200">
      <EventArchive user={user} />
    </div>
  );
}
