import { getSession } from "@/lib/auth";
import Settings from "./_components/settings-container";

export default async function RolesPage() {
  const session = await getSession();
  const user = session;
  return (
    <div className="space-y-6 bg-gray-900 text-gray-200">
      <Settings user={user} />
    </div>
  );
}
