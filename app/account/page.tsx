import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import StatusBadge from "@/components/status-badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      vendor: true,
      _count: { select: { orders: true } },
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">My account</h1>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-1">
              <StatusBadge status={user.role} />
            </div>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 text-sm dark:border-gray-800">
          <div>
            <dt className="text-gray-500">Member since</dt>
            <dd className="font-medium">{formatDate(user.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Total orders</dt>
            <dd className="font-medium">{user._count.orders}</dd>
          </div>
        </dl>
      </div>

      {user.vendor && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{user.vendor.storeName}</p>
              <div className="mt-1">
                <StatusBadge status={user.vendor.status} />
              </div>
            </div>
            <Link
              href="/vendor"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Vendor dashboard
            </Link>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link
          href="/account/orders"
          className="block rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-indigo-400 hover:shadow dark:border-gray-800 dark:bg-gray-900"
        >
          <p className="font-semibold">Order history →</p>
          <p className="mt-1 text-sm text-gray-500">
            View your past orders and their status
          </p>
        </Link>
      </div>
    </div>
  );
}
