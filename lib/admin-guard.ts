import { auth } from "@/lib/auth";

// Returns the session if the caller is an admin, otherwise null.
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}
