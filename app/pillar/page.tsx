import { getSession } from "@/lib/auth";
import Pillar from "./_components/pillar-container";
export default async function Page() {
  const session = await getSession();
  const user = session;
  return (
    <div className=" bg-neutral-900 min-h-screen text-gray-200">
      <Pillar user={user} />
    </div>
  );
}
