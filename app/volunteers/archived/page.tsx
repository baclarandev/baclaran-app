import { getSession } from "@/lib/auth";
import Archived from "./_components/archive-container";

export default async function ArchivedVolunteersPage() {
  const session = await getSession();
  const user = session;

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Archived user={user} />
      </div>
    </>
  );
}
