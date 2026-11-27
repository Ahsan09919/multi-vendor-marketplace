import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/dashboard-nav";
import StatusBadge from "@/components/status-badge";

export const metadata: Metadata = { title: "Vendor Dashboard" };

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/vendor");
  if (session.user.role !== "VENDOR" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {vendor && vendor.status !== "APPROVED" && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
          <StatusBadge status={vendor.status} />
          {vendor.status === "PENDING"
            ? "Your store is awaiting admin approval. You can look around, but you cannot publish products yet."
            : "Your store has been suspended. Contact the site admin for details."}
        </div>
      )}
      <div className="flex flex-col gap-8 lg:flex-row">
        <DashboardNav
          title="Vendor"
          items={[
            { href: "/vendor", label: "Dashboard" },
            { href: "/vendor/products", label: "Products" },
            { href: "/vendor/orders", label: "Orders" },
          ]}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
