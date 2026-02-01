import { SessionUser } from "@/lib/auth";
import { getRoleLevel, ROLE_LEVEL } from "./rbac";

export function volunteerScope(user: SessionUser) {
  const level = getRoleLevel(user);

  // ADMIN & STAFF → full access
  if (level >= ROLE_LEVEL.STAFF) return {};

  // CHAIRMAN → ministry only
  if (level >= ROLE_LEVEL.CHAIRMAN) {
    if (!user.ministryId) throw new Error("Chairman must have ministryId");

    return {
      VolunteerDetail: {
        some: {
          ministry_id: user.ministryId,
        },
      },
    };
  }

  // VOLUNTEER → own record only
  return { email: user.email };
}
