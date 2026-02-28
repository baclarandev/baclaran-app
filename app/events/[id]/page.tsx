// ---------------- API ----------------

import { getSession } from "@/lib/auth";
import EventInfo from "./event-info";

// ---------------- Component ----------------
export default async function EventAttendance({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;

  const user = await getSession();
  return (
    <div className="w-full bg-neutral-800 ">
      <EventInfo eventId={eventId} user={user} />
    </div>
  );
}
