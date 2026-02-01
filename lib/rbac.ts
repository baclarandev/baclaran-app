import { Role } from "@prisma/client";
import { SessionUser } from "@/lib/auth";

export const ROLE_LEVEL: Record<Role, number> = {
  VOLUNTEER: 10,
  STAFF: 30,
  CHAIRMAN: 60,
  ADMIN: 100,
};

export function getRoleLevel(user: SessionUser) {
  return user.role ? ROLE_LEVEL[user.role] : 0;
}

export function hasLevel(user: SessionUser, minLevel: number) {
  return getRoleLevel(user) >= minLevel;
}

export const can = {
  isVolunteer: (user: SessionUser) => hasLevel(user, ROLE_LEVEL.VOLUNTEER),
  isStaff: (user: SessionUser) => hasLevel(user, ROLE_LEVEL.STAFF),
  isChairman: (user: SessionUser) => hasLevel(user, ROLE_LEVEL.CHAIRMAN),
  isAdmin: (user: SessionUser) => hasLevel(user, ROLE_LEVEL.ADMIN),
};
