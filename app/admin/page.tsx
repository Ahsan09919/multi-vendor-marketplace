import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import RevenueChart from "@/components/revenue-chart";

export const dynamic = "force-dynamic";

const PAID_STATUSES = ["PAID", "SHIPPED", "DELIVERED"] as const;

export default async function AdminDashboardPage() {
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const [userCount, vendorCount, pendingVendors, productCount, orderCount, paidOrders, recentPaid, topItems] =
    await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.vendor.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: { in: [...PAID_STATUSES] } },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: since } },
        select: { total: true, createdAt: true },
      }),
      prisma.orderItem.groupBy({
        by: ["title"],
        where: { order: { status: { in: [...PAID_STATUSES] } } },
        _sum: { quantity: true, priceAtPurchase: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

  const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);

  // Build a 14-day revenue series.
  const days: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    days.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: 0,
      orders: 0,
    });
  }
  for (const order of recentPaid) {
    const idx = Math.floor(
      (new Date(order.createdAt).setHours(0, 0, 0, 0) - since.getTime()) / 86400000
    );
    if (idx >= 0 && idx < 14) {
      days[idx].revenue += order.total / 100;
      days[idx].orders += 1;
    }
  }

  const stats = [
    { label: "Total revenue", value: formatPrice(totalRevenue) },
    { label: "Orders", value: String(orderCount) },
    { label: "Products", value: String(productCount) },
    { label: "Users", value: String(userCount) },
    {
      label: "Vendors",
      value: pendingVendors > 0 ? `${vendorCount} (${pendingVendors} pending)` : String(vendorCount),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {stat.label}
            </p>
            <p className="mt-2 text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Revenue — last 14 days</h2>
        <div className="mt-4">
          <RevenueChart data={days} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-semibold">Top products (by units sold)</h2>
        {topItems.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No paid orders yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {topItems.map((item, i) => (
              <li key={item.title} className="flex items-center justify-between">
                <span>
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                    {i + 1}
                  </span>
                  {item.title}
                </span>
                <span className="font-medium">{item._sum.quantity ?? 0} sold</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
