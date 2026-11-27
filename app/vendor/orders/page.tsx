import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/status-badge";

export const dynamic = "force-dynamic";

export const metadata = { title: "Vendor orders" };

export default async function VendorOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });
  if (!vendor) {
    return <p className="text-sm text-gray-500">No vendor profile found.</p>;
  }

  const items = await prisma.orderItem.findMany({
    where: { vendorId: vendor.id },
    include: {
      order: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          shippingAddress: true,
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  });

  // Group items by order.
  const orders = new Map<
    string,
    { order: (typeof items)[number]["order"]; items: typeof items; subtotal: number }
  >();
  for (const item of items) {
    const entry = orders.get(item.orderId) ?? {
      order: item.order,
      items: [] as typeof items,
      subtotal: 0,
    };
    entry.items.push(item);
    entry.subtotal += item.priceAtPurchase * item.quantity;
    orders.set(item.orderId, entry);
  }

  const grouped = Array.from(orders.values());

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders with my products</h1>

      {grouped.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <p className="font-semibold">No orders yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Orders containing your products will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {grouped.map(({ order, items: orderItems, subtotal }) => (
            <div
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-gray-400">{order.id}</p>
                  <p className="mt-1 text-sm">
                    {formatDate(order.createdAt)} · Customer: {order.user.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
              </div>
              <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm dark:border-gray-800">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.title} × {item.quantity}
                    </span>
                    <span className="text-gray-500">
                      {formatPrice(item.priceAtPurchase * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Ship to: {order.shippingAddress}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
