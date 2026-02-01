import { getSession } from "@/lib/auth";
import Attendance from "./_components/attendance";

const page = async () => {
  const session = await getSession();
  const user = session;
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Attendance user={user} />
    </div>
  );
};

export default page;
