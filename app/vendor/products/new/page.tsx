import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/product-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });
  if (!vendor) redirect("/vendor");
  if (vendor.status !== "APPROVED") {
    return (
      <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-8 text-center text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
        <p className="font-semibold">Store not approved yet</p>
        <p className="mt-1 text-sm">
          You can add products once an admin approves your store.
        </p>
      </div>
    );
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">New product</h1>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
