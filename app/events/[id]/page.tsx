// ---------------- API ----------------

import { getSession } from "@/lib/auth";
import EventInfo from "./event-info";

export default async function EventAttendance({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const user = await getSession();

  return (
    <div className="w-full bg-neutral-800">
      <EventInfo eventId={id} user={user} />
    </div>
  );
}
