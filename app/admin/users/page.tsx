import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import StatusBadge from "@/components/status-badge";
import UserActions from "@/components/admin/user-actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    include: {
      vendor: { select: { storeName: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.role} />
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {u.vendor?.storeName ?? "—"}
                </td>
                <td className="px-4 py-3">{u._count.orders}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <UserActions
                    userId={u.id}
                    role={u.role}
                    isSelf={u.id === session?.user?.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
