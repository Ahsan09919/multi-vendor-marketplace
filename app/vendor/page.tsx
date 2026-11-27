import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendor) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
        <p className="font-semibold">No vendor profile</p>
        <p className="mt-1 text-sm text-gray-500">
          This account does not have a store attached.
        </p>
      </div>
    );
  }

  const [productCount, activeCount, soldItems] = await Promise.all([
    prisma.product.count({ where: { vendorId: vendor.id } }),
    prisma.product.count({ where: { vendorId: vendor.id, isActive: true } }),
    prisma.orderItem.findMany({
      where: {
        vendorId: vendor.id,
        order: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      },
      select: { quantity: true, priceAtPurchase: true, orderId: true },
    }),
  ]);

  const revenue = soldItems.reduce((s, i) => s + i.priceAtPurchase * i.quantity, 0);
  const unitsSold = soldItems.reduce((s, i) => s + i.quantity, 0);
  const orderCount = new Set(soldItems.map((i) => i.orderId)).size;

  const stats = [
    { label: "Revenue (paid orders)", value: formatPrice(revenue) },
    { label: "Orders", value: String(orderCount) },
    { label: "Units sold", value: String(unitsSold) },
    { label: "Products", value: `${activeCount} active / ${productCount}` },
  ];

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{vendor.storeName}</h1>
        <Link
          href="/vendor/products/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add product
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/vendor/products"
          className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-indigo-400 hover:shadow dark:border-gray-800 dark:bg-gray-900"
        >
          <p className="font-semibold">Manage products →</p>
          <p className="mt-1 text-sm text-gray-500">
            Create, edit and delete your products, update stock.
          </p>
        </Link>
        <Link
          href="/vendor/orders"
          className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-indigo-400 hover:shadow dark:border-gray-800 dark:bg-gray-900"
        >
          <p className="font-semibold">View orders →</p>
          <p className="mt-1 text-sm text-gray-500">
            See orders that contain your products.
          </p>
        </Link>
      </div>
    </div>
  );
}
