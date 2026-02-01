import { getSession } from "@/lib/auth";
import Tasks from "./_components/task-container";

export default async function TasksPage() {
  const session = getSession();
  const user = await session;
  return (
    <div className="space-y-6 bg-gray-900 text-gray-200">
      <Tasks user={user} />
    </div>
  );
}
