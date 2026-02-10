import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CreateUserInput {
  email: string;
  password: string;
  role: "ADMIN" | "CHAIRMAN" | "STAFF";
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to create user");
      }

      return json.data;
    },

    onSuccess: () => {
      // if you later add a users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
export interface User {
  id: number;
  name: string | null;
  email: string;
    role: "ADMIN" | "VOLUNTEER";
  ministryId: number | null;
  ministry: {
    id: number;
    name: string;
  } | null;
    ministryType?: "LITURGICAL" | "PASTORAL" | null;
  createdAt: string;
}

export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch("/api/auth/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};
import { useQuery } from "@tanstack/react-query";

export const useUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });
};
