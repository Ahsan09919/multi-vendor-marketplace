import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate, PLACEHOLDER_IMAGE } from "@/lib/utils";
import StatusBadge from "@/components/status-badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { slug: true } },
          vendor: { select: { storeName: true } },
        },
      },
    },
  });

  if (!order) notFound();
  if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/account/orders");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/account/orders" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
        ← Back to orders
      </Link>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order details</h1>
          <p className="mt-1 font-mono text-xs text-gray-400">{order.id}</p>
          <p className="mt-1 text-sm text-gray-500">Placed {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border-b border-gray-100 p-4 last:border-0 dark:border-gray-800"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <Image
                src={item.image || PLACEHOLDER_IMAGE}
                alt={item.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              {item.product ? (
                <Link
                  href={`/products/${item.product.slug}`}
                  className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {item.title}
                </Link>
              ) : (
                <p className="font-medium">{item.title}</p>
              )}
              <p className="text-xs text-gray-500">
                {item.vendor ? `Sold by ${item.vendor.storeName} · ` : ""}
                Qty {item.quantity}
              </p>
            </div>
            <p className="font-semibold">
              {formatPrice(item.priceAtPurchase * item.quantity)}
            </p>
          </div>
        ))}
        <div className="flex justify-between bg-gray-50 p-4 font-bold dark:bg-gray-800/50">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-sm font-semibold text-gray-500">Shipping address</h2>
        <p className="mt-1 text-sm">{order.shippingAddress}</p>
      </div>
    </div>
  );
}
