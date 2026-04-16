import { getSession } from "@/lib/auth";
import SummaryContainer from "./_components/summary-container";

export default async function AttendanceSummary() {
  const session = await getSession();
  const user = session;
  return (
    <div className="min-h-screen bg-neutral-900 text-gray-200">
      <SummaryContainer user={user} />
    </div>
  );
}
