import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/status-badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">My orders</h1>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <p className="font-semibold">No orders yet</p>
          <p className="mt-1 text-sm text-gray-500">
            When you place an order it will show up here.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-indigo-400 hover:shadow sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <p className="font-mono text-xs text-gray-400">{order.id}</p>
                <p className="mt-1 text-sm">
                  {formatDate(order.createdAt)} · {order._count.items} item
                  {order._count.items === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={order.status} />
                <span className="font-bold">{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
