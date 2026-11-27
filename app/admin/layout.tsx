import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardNav from "@/components/dashboard-nav";

export const metadata: Metadata = { title: "Admin Panel" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <DashboardNav
          title="Admin"
          items={[
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/orders", label: "Orders" },
            { href: "/admin/products", label: "Products" },
            { href: "/admin/vendors", label: "Vendors" },
            { href: "/admin/users", label: "Users" },
            { href: "/admin/categories", label: "Categories" },
          ]}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
