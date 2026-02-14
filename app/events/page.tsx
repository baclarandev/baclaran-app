import { getSession } from "@/lib/auth";
import Events from "./_components/events-container";

export default async function EventsPage() {
  const session = await getSession();
  const user = session;
  return (
    <div className=" bg-neutral-900 min-h-screen text-gray-200">
      <Events user={user} />
    </div>
  );
}
