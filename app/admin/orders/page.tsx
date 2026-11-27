import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import OrderStatusSelect from "@/components/admin/order-status-select";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                <td className="px-4 py-3">
                  <Link
                    href={`/account/orders/${o.id}`}
                    className="font-mono text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {o.id.slice(0, 12)}…
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p>{o.user.name}</p>
                  <p className="text-xs text-gray-500">{o.user.email}</p>
                </td>
                <td className="px-4 py-3">{o._count.items}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <OrderStatusSelect orderId={o.id} status={o.status} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
