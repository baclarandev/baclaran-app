import { getSession } from "@/app/lib/auth";
import MinistryInfo from "./_components/mininstry-info";

export default async function MinistryMembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ministryId = (await params).id;
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-gray-900">
      <MinistryInfo user={session} ministryId={ministryId} />
    </div>
  );
}
